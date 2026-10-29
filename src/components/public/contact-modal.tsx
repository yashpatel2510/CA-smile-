"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock, ShieldCheck, PhoneCall } from "lucide-react";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

interface ContactModalOptions {
  service?: string;
  doctor?: string;
}

interface ContactModalContextType {
  isOpen: boolean;
  openContactModal: (options?: ContactModalOptions) => void;
  closeContactModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType>({
  isOpen: false,
  openContactModal: () => {},
  closeContactModal: () => {},
});

export function useContactModal() {
  return useContext(ContactModalContext);
}

export function ContactModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialService, setInitialService] = useState<string | undefined>(
    undefined
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const { brandConfig } = useClinicTheme();

  const openContactModal = useCallback((options?: ContactModalOptions) => {
    if (options?.service) {
      setInitialService(options.service);
    }
    setIsOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeContactModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeContactModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Check URL hash for #contact on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.hash === "#contact" ||
        window.location.search.includes("contact=open")
      ) {
        setIsOpen(true);
      }
    }
  }, []);

  // Light dismiss fallback: detect clicks on backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeContactModal();
    }
  };

  return (
    <ContactModalContext.Provider
      value={{ isOpen, openContactModal, closeContactModal }}
    >
      {children}

      {/* Smooth Animated Contact Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/65 backdrop-blur-md overflow-y-auto"
            aria-modal="true"
            role="dialog"
            aria-label="Contact and Appointment Booking Form"
          >
            {/* Modal Card Container */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 350,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl my-auto rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl focus:outline-none"
            >
              {/* Floating Close Button */}
              <button
                type="button"
                onClick={closeContactModal}
                aria-label="Close contact form"
                className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
                title="Press Esc to close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-90" />
              </button>

              {/* Enhanced Calendar & Contact Experience */}
              <CalendarBookingExperience
                initialService={initialService}
                isModal={true}
                onClose={closeContactModal}
                onSuccess={() => {
                  // After successful booking, keep open so user sees confirmation card
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContactModalContext.Provider>
  );
}
