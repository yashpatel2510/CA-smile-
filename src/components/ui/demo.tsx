import Faq from "@/components/ui/faq";
import Component, {
  TestimonialsSection,
  TestimonialsColumn,
  Testimonial,
  defaultTestimonials,
} from "@/components/ui/testimonial-v2";

export {
  TestimonialsSection as Testimonials,
  TestimonialsColumn,
  defaultTestimonials,
};
export type { Testimonial, Testimonial as TestimonialItem };

export function FaqDemo() {
  return <Faq />;
}

export default function Demo() {
  return <Faq />;
}
