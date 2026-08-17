"use client";
import {usePathname} from "next/navigation";import {SmoothScroll} from "@/components/motion/SmoothScroll";import {CustomCursor} from "@/components/motion/CustomCursor";import {Header} from "@/components/site/Header";import {Footer} from "@/components/site/Footer";import {BookingDock} from "@/components/site/BookingDock";import {PageTransition} from "@/components/motion/PageTransition";
export function AppChrome({children}:{children:React.ReactNode}){
  const p = usePathname();
  const admin = p.startsWith("/admin");
  const isAuth = p === "/signin" || p === "/signup";
  const isBooking = p.startsWith("/booking");

  if (admin || isAuth || isBooking) {
    return (
      <>
        <CustomCursor />
        {children}
      </>
    );
  }

  return (
    <>
      <SmoothScroll />
      <CustomCursor />
      <Header />
      <PageTransition>{children}</PageTransition>
      <BookingDock />
      <Footer />
    </>
  );
}

