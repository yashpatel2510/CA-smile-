"use client";

import React from "react";
import { DarkContactSection } from "./dark-contact-section";

export { DarkContactSection };

export function ContactForm() {
  return <DarkContactSection showCalendarLink={false} />;
}
