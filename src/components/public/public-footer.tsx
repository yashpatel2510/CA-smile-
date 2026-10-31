import Link from "next/link";
import { Stethoscope, Heart, Clock, MapPin, Mail, Phone } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface text-brand-text">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-clinic bg-brand-primary text-brand-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="font-bold font-heading text-base">CA Smile Dental Clinic</span>
            </div>
            <p className="text-sm text-brand-muted">
              Compassionate, advanced painless dental care tailored to your family&apos;s needs. Providing endodontics, smile design, implants, and orthodontics in Bilimora.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-brand-muted pt-2">
              <Heart className="h-3.5 w-3.5 text-brand-primary" />
              <span>Certified Dental Healthcare Quality Provider</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><Link href="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-brand-primary transition-colors">Services & Pricing</Link></li>
              <li><Link href="/doctors" className="hover:text-brand-primary transition-colors">Doctors & Staff</Link></li>
              <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Book Appointment</Link></li>
              <li><Link href="/admin" className="hover:text-brand-primary transition-colors">Staff & Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold mb-3">Clinic Hours</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>Sunday: By Prior Appointment</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold mb-3">Contact & Location</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <span>1st Floor, Labdhi Arcade, Above HDFC Bank, Convent Rd, Bilimora, Gujarat 396321</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>+91 72260 98074</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>casmileatbilimora@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-brand-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} CA Smile Dental Clinic. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
