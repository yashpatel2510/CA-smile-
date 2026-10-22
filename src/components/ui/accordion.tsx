"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type?: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: [],
  toggleItem: () => {},
  type: "single",
});

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({
  children,
  type = "single",
  defaultValue,
  className,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === "string") return [defaultValue];
    return [];
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        }
        return prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value];
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn("space-y-3", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({
  children,
  value,
  className,
  ...props
}: AccordionItemProps) {
  return (
    <div
      data-value={value}
      className={cn(
        "rounded-2xl sm:rounded-[22px] bg-[#f4f4f6] hover:bg-[#ededf0] transition-colors duration-200 overflow-hidden",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value } as any);
        }
        return child;
      })}
    </div>
  );
}

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
}

export function AccordionTrigger({
  children,
  value = "",
  className,
  ...props
}: AccordionTriggerProps) {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      aria-expanded={isOpen}
      className={cn(
        "w-full flex items-center justify-between text-left px-6 py-5 sm:px-8 sm:py-6 select-none focus:outline-none cursor-pointer",
        className
      )}
      {...props}
    >
      <span className="font-sans text-base sm:text-[17px] font-medium text-neutral-900 pr-6">
        {children}
      </span>
      <motion.svg
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-800 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </motion.svg>
    </button>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}

export function AccordionContent({
  children,
  value = "",
  className,
  ...props
}: AccordionContentProps) {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="accordion-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              "px-6 pb-6 pt-1 sm:px-8 sm:pb-7 text-neutral-600 text-sm sm:text-[15px] leading-relaxed",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
