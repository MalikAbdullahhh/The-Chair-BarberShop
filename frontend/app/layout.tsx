import type { Metadata } from "next";
import { Manrope, Bodoni_Moda, Barlow_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { BookingProvider } from "@/components/providers/BookingProvider";
import { AppChrome } from "@/components/providers/AppChrome";
import { PublicDataProvider } from "@/components/providers/PublicDataProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const sans=Manrope({subsets:['latin'],variable:'--font-sans'});const serif=Bodoni_Moda({subsets:['latin'],variable:'--font-serif'});const condensed=Barlow_Condensed({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-condensed'});
export const metadata:Metadata={title:{default:'THE CHAIR — Time, Protected.',template:'%s — THE CHAIR'},description:'A private grooming experience built around your time.'};
export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} ${condensed.variable}`}>
        <AuthProvider>
          <BookingProvider>
            <PublicDataProvider>
              <AppChrome>{children}</AppChrome>
              <AuthModal />
            </PublicDataProvider>
          </BookingProvider>
        </AuthProvider>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#121210",
              color: "#f5f3ed",
              border: "1px solid #333330",
              borderRadius: "0px",
              fontFamily: "var(--font-condensed)",
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }
          }}
        />
      </body>
    </html>
  );
}

