"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditorialImage as Image } from "@/components/media/EditorialImage";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { media } from "@/data/media";

import { useAuth } from "@/components/providers/AuthProvider";
import { User } from "lucide-react";

const nav = [["SERVICES","/services"],["BARBERS","/barbers"],["WORK","/lookbook"],["MEMBERSHIP","/membership"],["HOUSE","/house"],["JOURNAL","/journal"]] as const;

export function Header(){
  const pathname=usePathname();
  const { user, openAuthModal } = useAuth();
  const [menu,setMenu]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [hover,setHover]=useState(0);
  const {scrollY}=useScroll();
  
  useEffect(() => {
    return scrollY.on("change", (v) => {
      setScrolled(v > 70);
    });
  }, [scrollY]);

  const solid=pathname!=="/" || scrolled;

  const previews=[media.hero,media.detail,...media.portraits,media.house,media.tools];
  return <>
    <header className={`brand-header ${solid?"solid":""}`}>
      <Link className="brand-mark" href="/"><b>THE</b><strong>CHAIR</strong></Link>
      <nav aria-label="Primary navigation">{nav.map(([l,h])=><Link href={h} key={h} data-cursor="OPEN">{l}</Link>)}</nav>
      <div className="header-actions">
        {user ? (
          <Link href="/account" className="header-auth-btn is-logged" data-cursor="ACCOUNT">
            <User size={13} />
            <span>{user.name.split(" ")[0].toUpperCase()}</span>
          </Link>
        ) : (
          <Link
            href="/signin"
            className="header-auth-btn"
            data-cursor="ACCOUNT"
          >
            <span>SIGN IN</span>
          </Link>
        )}
        <Link className="header-book" href="/booking" data-cursor="BOOK"><span>BOOK A CHAIR</span><ArrowUpRight size={16}/></Link>
        <button className="menu-trigger" onClick={()=>setMenu(true)} aria-label="Open menu"><span>MENU</span><i>+</i></button>
      </div>
    </header>
    <AnimatePresence>{menu&&<motion.div className="menu-panel" initial={{clipPath:"inset(0 0 100% 0)"}} animate={{clipPath:"inset(0 0 0% 0)"}} exit={{clipPath:"inset(0 0 100% 0)"}} transition={{duration:.62,ease:[.76,0,.24,1]}}>
      <div className="menu-visual"><AnimatePresence mode="wait"><motion.div key={hover} initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.99}} transition={{duration:.3}}><Image src={previews[hover%previews.length]} alt="The Chair destination preview" fill sizes="36vw"/></motion.div></AnimatePresence><div className="menu-live"><span>HOUSE STATUS</span><b>OPEN / UNTIL 20:00</b><small>NEXT CHAIR / 17:30</small></div></div>
      <div className="menu-main">
        <div className="menu-top">
          <span>THE CHAIR / MANCHESTER</span>
          <button onClick={()=>setMenu(false)}><span>CLOSE</span><X size={16}/></button>
        </div>
        <nav>
          {[["BOOK","/booking"],...nav,["VISIT","/visit"],["CLIENT FILE / ACCOUNT","/account"]].map(([l,h],i)=><Link href={h} key={h} onMouseEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onClick={()=>setMenu(false)}><span>{String(i+1).padStart(2,"0")}</span><b>{l}</b><ArrowUpRight size={18}/></Link>)}
        </nav>
        <div className="menu-foot">
          <span>14 KING STREET / M2</span>
          <span>MON-SAT / 09:00-20:00</span>
          <span>@THECHAIR.HOUSE</span>
        </div>
      </div>
    </motion.div>}</AnimatePresence>
  </>
}

