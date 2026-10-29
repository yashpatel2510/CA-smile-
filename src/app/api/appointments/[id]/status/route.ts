import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import {
  updateAppointmentStatusSchema,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/lib/validations/appointment";
import { sendEmail } from "@/lib/email";
import {
  renderBookingConfirmedEmail,
  renderBookingDeclinedEmail,
  renderBookingCancelledEmail,
} from "@/lib/email-templates";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const body = await req.json();

    const parseResult = updateAppointmentStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed for status update",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      status,
      staffUserId,
      performedBy,
      reason,
      startTime,
      endTime,
      forceOverride,
      procedure,
      treatmentNotes,
      dentistNotes,
      paidAmount,
      paymentMethod,
      nextSessionRequired,
      nextSessionDate,
      nextSessionTime,
      nextSessionDoctor,
      nextSessionNotes,
    } = parseResult.data;

    let existingAppointment: any = null;
    let isMemoryFallback = false;

    try {
      existingAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          service: true,
          staffUser: true,
          treatment: {
            include: {
              sessions: true,
            },
          },
          treatmentSession: true,
        },
      });
    } catch {
      isMemoryFallback = true;
      existingAppointment = inMemoryStore.getAppointment(appointmentId);
    }

    if (!existingAppointment && !isMemoryFallback) {
      existingAppointment = inMemoryStore.getAppointment(appointmentId);
      if (existingAppointment) isMemoryFallback = true;
    }

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: `Appointment ${appointmentId} not found` },
        { status: 404 }
      );
    }

    const previousStatus = existingAppointment.status;

    // Requirement 2: Status Transition Validation
    if (!forceOverride && previousStatus !== status) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[previousStatus] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            invalidTransition: true,
            message: `Invalid status transition: Cannot move from ${previousStatus} directly to ${status}. Allowed next steps: [${allowed.join(", ") || "None"}]. Set forceOverride to bypass.`,
          },
          { status: 422 }
        );
      }
    }

    const nowIso = new Date().toISOString();
    const nowDate = new Date();

    let updatedAppointment: any;
    let auditEntry: any;
    let nextCreatedAppointment: any = null;

    if (!isMemoryFallback) {
      try {
        const updateData: any = {
          status,
          staffUserId: staffUserId || existingAppointment.staffUserId,
        };

        if (reason) {
          updateData.notes = existingAppointment.notes
            ? `${existingAppointment.notes} | ${reason}`
            : reason;
        }

        if (startTime) updateData.startTime = new Date(startTime);
        if (endTime) updateData.endTime = new Date(endTime);

        // Status timestamp updates
        if (status === "CONFIRMED" && !existingAppointment.confirmedAt) {
          updateData.confirmedAt = nowDate;
        } else if (status === "CHECKED_IN") {
          updateData.checkedInAt = nowDate;
        } else if (status === "TREATMENT_STARTED") {
          updateData.treatmentStartedAt = nowDate;
        } else if (status === "TREATMENT_DONE") {
          updateData.treatmentDoneAt = nowDate;
          if (typeof paidAmount === "number" && paidAmount > 0) {
            updateData.paidAmount =
              Number(existingAppointment.paidAmount || 0) + paidAmount;
            if (
              Number(updateData.paidAmount) >=
              Number(existingAppointment.totalAmount || 0)
            ) {
              updateData.paymentStatus = "PAID";
            } else {
              updateData.paymentStatus = "PARTIAL";
            }
          }
        } else if (status === "CANCELLED") {
          updateData.cancelledAt = nowDate;
          updateData.cancellationReason = reason || "Cancelled by clinic";
        } else if (status === "NO_SHOW") {
          updateData.noShowAt = nowDate;
        }

        updatedAppointment = await prisma.appointment.update({
          where: { id: appointmentId },
          data: updateData,
          include: {
            patient: true,
            service: true,
            staffUser: true,
            treatment: {
              include: { sessions: true },
            },
            treatmentSession: true,
          },
        });

        try {
          inMemoryStore.updateAppointmentStatus(
            appointmentId,
            status as any,
            reason,
            performedBy
          );
        } catch {}

        // If Treatment Done, update linked session and Treatment status (Requirement 6, 7, 8)
        if (status === "TREATMENT_DONE") {
          if (existingAppointment.treatmentSession) {
            await prisma.treatmentSession.update({
              where: { id: existingAppointment.treatmentSession.id },
              data: {
                status: "TREATMENT_DONE",
                procedure: procedure || existingAppointment.treatmentSession.procedure,
                treatmentNotes: treatmentNotes || null,
                dentistNotes: dentistNotes || null,
                paidAmount: typeof paidAmount === "number" ? paidAmount : undefined,
                paymentMethod: paymentMethod || undefined,
                paymentStatus:
                  typeof paidAmount === "number" && paidAmount > 0 ? "PAID" : undefined,
                completedAt: nowDate,
                completedBy: performedBy,
                nextSessionRequired: Boolean(nextSessionRequired),
              },
            });
          }

          // Check treatment progress
          if (existingAppointment.treatmentId) {
            const trt = await prisma.treatment.findUnique({
              where: { id: existingAppointment.treatmentId },
              include: { sessions: true },
            });

            if (trt) {
              const newCompletedCount = trt.completedSessions + 1;
              const isFinal =
                newCompletedCount >= trt.totalSessions ||
                nextSessionRequired === false;

              const treatmentStatus = isFinal ? "COMPLETED" : "IN_PROGRESS";

              await prisma.treatment.update({
                where: { id: trt.id },
                data: {
                  completedSessions: newCompletedCount,
                  status: treatmentStatus as any,
                  paidAmount:
                    typeof paidAmount === "number"
                      ? Number(trt.paidAmount || 0) + paidAmount
                      : trt.paidAmount,
                },
              });

              // Requirement 6: If next session required is YES, auto-create next session appointment
              if (nextSessionRequired && nextSessionDate && nextSessionTime) {
                const nextDate = new Date(`${nextSessionDate}T${nextSessionTime}`);
                const nextEndDate = new Date(nextDate.getTime() + 45 * 60000);
                const nextSessionNum = newCompletedCount + 1;

                nextCreatedAppointment = await prisma.appointment.create({
                  data: {
                    clinicId: existingAppointment.clinicId,
                    patientId: existingAppointment.patientId,
                    serviceId: existingAppointment.serviceId,
                    treatmentId: trt.id,
                    startTime: nextDate,
                    endTime: nextEndDate,
                    status: "CONFIRMED",
                    source: "ADMIN",
                    preferredDoctor:
                      nextSessionDoctor || existingAppointment.preferredDoctor,
                    notes: `Session ${nextSessionNum}/${trt.totalSessions}: ${nextSessionNotes || "Follow-up treatment session"}`,
                    paidAmount: 0.0,
                    totalAmount: 0.0,
                  },
                });

                await prisma.treatmentSession.create({
                  data: {
                    treatmentId: trt.id,
                    appointmentId: nextCreatedAppointment.id,
                    sessionNumber: nextSessionNum,
                    totalSessions: trt.totalSessions,
                    status: "CONFIRMED",
                    procedure: nextSessionNotes || "Next Treatment Session",
                  },
                });
              }
            }
          }
        }

        // Create audit log asynchronously without blocking the client response
        auditEntry = {
          clinicId: existingAppointment.clinicId,
          appointmentId: existingAppointment.id,
          action: `APPOINTMENT_${status}`,
          performedBy,
          details:
            reason ||
            `Status transitioned from ${previousStatus} to ${status} by ${performedBy}`,
          createdAt: nowIso,
        };

        prisma.auditLog
          .create({
            data: {
              clinicId: existingAppointment.clinicId,
              appointmentId: existingAppointment.id,
              staffUserId: staffUserId || null,
              action: `APPOINTMENT_${status}`,
              entityType: "Appointment",
              entityId: existingAppointment.id,
              performedBy,
              details:
                reason ||
                `Status transitioned from ${previousStatus} to ${status} by ${performedBy}`,
              previousValues: { status: previousStatus },
              newValues: { status, reason: reason || null },
            },
          })
          .catch((err) => console.warn("Background audit log error:", err));
      } catch {
        isMemoryFallback = true;
      }
    }

    if (isMemoryFallback) {
      // In-memory fallback handler
      updatedAppointment = inMemoryStore.updateAppointmentStatus(
        appointmentId,
        status as any,
        reason,
        performedBy
      );

      if (status === "TREATMENT_DONE" && updatedAppointment) {
        if (typeof paidAmount === "number" && paidAmount > 0) {
          updatedAppointment.paidAmount =
            (updatedAppointment.paidAmount || 0) + paidAmount;
          if (updatedAppointment.paidAmount >= (updatedAppointment.totalAmount || 0)) {
            updatedAppointment.paymentStatus = "PAID";
          } else {
            updatedAppointment.paymentStatus = "PARTIAL";
          }
        }

        // Check treatment completion
        if (updatedAppointment.treatmentId) {
          const trt = inMemoryStore.getTreatment(updatedAppointment.treatmentId);
          if (trt) {
            const nextCompleted = (trt.completedSessions || 0) + 1;
            const isFinal =
              nextCompleted >= trt.totalSessions || nextSessionRequired === false;
            inMemoryStore.updateTreatmentStatus(
              trt.id,
              isFinal ? "COMPLETED" : "IN_PROGRESS",
              nextCompleted
            );

            // Auto-create next session in memory if required
            if (nextSessionRequired && nextSessionDate && nextSessionTime) {
              const nextStart = `${nextSessionDate}T${nextSessionTime}:00`;
              const nextEnd = new Date(
                new Date(nextStart).getTime() + 45 * 60000
              ).toISOString();
              const nextSessionNum = nextCompleted + 1;
              const nextId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;

              const newSes = inMemoryStore.saveTreatmentSession({
                id: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
                treatmentId: trt.id,
                appointmentId: nextId,
                sessionNumber: nextSessionNum,
                totalSessions: trt.totalSessions,
                status: "CONFIRMED",
                amount: 0,
                paidAmount: 0,
                paymentStatus: "PENDING",
                createdAt: nowIso,
                updatedAt: nowIso,
              });

              nextCreatedAppointment = inMemoryStore.saveAppointment({
                id: nextId,
                startTime: nextStart,
                endTime: nextEnd,
                status: "CONFIRMED",
                source: "ADMIN",
                treatmentId: trt.id,
                treatment: trt,
                treatmentSessionId: newSes.id,
                treatmentSession: newSes,
                notes: `Session ${nextSessionNum}/${trt.totalSessions}: ${nextSessionNotes || "Next scheduled session"}`,
                patient: updatedAppointment.patient,
                service: updatedAppointment.service,
                preferredDoctor:
                  nextSessionDoctor || updatedAppointment.preferredDoctor,
                createdAt: nowIso,
                updatedAt: nowIso,
              });
            }
          }
        }
      }

      auditEntry = {
        action: `APPOINTMENT_${status}`,
        performedBy,
        entityType: "Appointment",
        entityId: appointmentId,
        details: reason || `Status updated to ${status}`,
        createdAt: nowIso,
      };
    }

    // Patient email notifications
    const patientEmail = updatedAppointment?.patient?.email;
    if (patientEmail) {
      try {
        const appointmentTimeDate = updatedAppointment.startTime
          ? new Date(updatedAppointment.startTime)
          : new Date();

        const templateData = {
          patientName: `${updatedAppointment.patient?.firstName || "Valued"} ${
            updatedAppointment.patient?.lastName || "Patient"
          }`.trim(),
          serviceName:
            updatedAppointment.service?.name || "Dental Clinical Treatment",
          appointmentDate: appointmentTimeDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          appointmentTime: appointmentTimeDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          doctorName:
            updatedAppointment.preferredDoctor ||
            updatedAppointment.staffUser?.name ||
            "Chief Dental Surgeon",
          servicePrice: updatedAppointment.totalAmount
            ? String(updatedAppointment.totalAmount)
            : "0.00",
          durationMinutes: updatedAppointment.service?.durationMinutes || 30,
          reason,
        };

        if (status === "CONFIRMED") {
          const email = renderBookingConfirmedEmail(templateData);
          sendEmail({
            to: patientEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
          }).catch(() => {});
        } else if (status === "DECLINED") {
          const email = renderBookingDeclinedEmail(templateData);
          sendEmail({
            to: patientEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
          }).catch(() => {});
        } else if (status === "CANCELLED") {
          const email = renderBookingCancelledEmail(templateData);
          sendEmail({
            to: patientEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
          }).catch(() => {});
        }
      } catch {
        // Safe fail
      }
    }


    return NextResponse.json({
      success: true,
      message: `Appointment successfully transitioned to ${status}.`,
      appointment: updatedAppointment,
      nextSessionAppointment: nextCreatedAppointment,
      auditLog: auditEntry,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update appointment status",
      },
      { status: 500 }
    );
  }
}

export const POST = PATCH;

