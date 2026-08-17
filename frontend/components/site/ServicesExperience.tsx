"use client";
import {EditorialImage as Image} from "@/components/media/EditorialImage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {motion,useScroll,useTransform} from "framer-motion";
import {services,barbers,looks} from "@/data/site";
import {media} from "@/data/media";
import {RevealLines,RevealText} from "@/components/motion/RevealText";
import {ScrollWords} from "@/components/motion/ScrollWords";
import {ParallaxMedia} from "@/components/motion/ParallaxMedia";
import {useBooking} from "@/components/providers/BookingProvider";
import {usePublicData} from "@/components/providers/PublicDataProvider";

function Anatomy(){
  const ref = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scanTop = useTransform(scrollYProgress, [0, 1], ["8%", "92%"]);
  const progressPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(5, Math.floor(v * 6));
      setActiveStage(idx);
    });
  }, [scrollYProgress]);

  const stages = [
    { time: "00:00", title: "CONSULT", copy: "We decide what the cut needs to solve before touching it." },
    { time: "05:00", title: "PREP", copy: "Section, wet or dry, and establish the first structural line." },
    { time: "10:00", title: "CUT", copy: "Remove weight with Japanese shears. Keep what makes the hair work." },
    { time: "35:00", title: "DETAIL", copy: "Edges, balance, transition, skin blend cross-check." },
    { time: "42:00", title: "STYLE", copy: "Build the finish you can actually repeat at home tomorrow." },
    { time: "45:00", title: "DONE", copy: "Mirror check. Micro adjustments. No rush to the door." }
  ];

  return (
    <section ref={ref} className="svc-anatomy">
      <div className="svc-anatomy-pin">
        <div className="anatomy-media">
          <Image src={media.detail} alt="Service anatomy detail" fill priority={false} sizes="50vw" />
          <motion.div className="anatomy-scan" style={{ top: scanTop }} />
          <div className="anatomy-scan-overlay" />
          <div className="anatomy-live-marker">
            <small>CURRENT PHASE</small>
            <b>{stages[activeStage]?.title} ({stages[activeStage]?.time})</b>
          </div>
        </div>
        <div className="anatomy-copy">
          <div className="anatomy-top-meta">
            <span>03 / SIGNATURE CUT ANATOMY</span>
            <div className="anatomy-progress-track">
              <motion.div className="anatomy-progress-fill" style={{ width: progressPercent }} />
            </div>
          </div>
          <h2>
            FORTY-FIVE<br />
            <em>MINUTES,<br />VISIBLE.</em>
          </h2>
          <div className="anatomy-stages">
            {stages.map((st, i) => {
              const isActive = activeStage === i;
              const isPast = activeStage > i;
              return (
                <div
                  key={st.title}
                  className={`anatomy-stage-row ${isActive ? "active" : isPast ? "past" : ""}`}
                >
                  <span className="stage-time">{st.time}</span>
                  <b className="stage-name">{st.title}</b>
                  <p className="stage-copy">{st.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Matcher({services}:{services:any[]}){const [a,setA]=useState(0);const [b,setB]=useState(0);const result=services[[0,1,3,4][Math.min(3,a+b)]%services.length];return <section className="svc-matcher"><div><span>09 / SERVICE MATCHER</span><h2>DON'T KNOW<br/><em>THE NAME?</em></h2><p>Good. Describe the situation instead.</p></div><div className="matcher-questions"><label>HOW MUCH CHANGE?<div>{['TIDY','NOTICEABLE','RESET'].map((x,i)=><button className={a===i?'active':''} onClick={()=>setA(i)} key={x}>{x}</button>)}</div></label><label>BEARD TOO?<div>{['NO','YES'].map((x,i)=><button className={b===i?'active':''} onClick={()=>setB(i)} key={x}>{x}</button>)}</div></label></div><motion.aside layout><small>START HERE</small><b>{result.name}</b><p>{result.description}</p><span>{result.duration} MIN / FROM £{result.price}</span><Link href="/booking">BOOK THIS SERVICE </Link></motion.aside></section>}
export function ServicesExperience(){const booking=useBooking();const {services,barbers}=usePublicData();const [active,setActive]=useState(0);const [length,setLength]=useState(1);const [restyle,setRestyle]=useState(1);const serviceAt=(i:number)=>services[i%Math.max(services.length,1)]||services[0];const lengthBarber=barbers[1]||barbers[0];return <main className="services-v2">
<section className="svc-hero"><div className="svc-hero-copy"><span>01 / SERVICES</span><h1><RevealLines lines={['TIME','WITH A']}/><em><RevealLines lines={['PURPOSE.']}/></em></h1><p>Every service is designed around enough time to understand the problem, make the cut and finish without manufacturing urgency.</p></div><div className="svc-hero-media"><ParallaxMedia src={media.tools} alt="Barber tools" speed={8}/><span>NOT A MENU.<br/>A TIME LEDGER.</span></div></section>
<section className="svc-index"><div className="section-index"><span>02</span><b>CHOOSE BY OUTCOME</b><small>HOVER / SELECT / BOOK</small></div>{services.map((s,i)=><motion.button key={s._id} className={active===i?'active':''} onMouseEnter={()=>setActive(i)} onClick={()=>{setActive(i);booking.setService(s)}}><span>{String(i+1).padStart(2,'0')}</span><b>{s.name}</b><p>{s.description}</p><small>{s.duration} MIN</small><strong>£{s.price}</strong><i></i><motion.div className="svc-index-image" initial={false} animate={{clipPath:active===i?'inset(0 0 0 0)':'inset(100% 0 0 0)'}}><Image src={s.image||media.detail} alt={s.name} fill/></motion.div></motion.button>)}</section>
<Anatomy/>
<section className="svc-fade-anatomy"><div className="fade-copy"><span>04 / FADE ANATOMY</span><h2>THE FADE IS<br/><em>THE TRANSITION.</em></h2><ScrollWords text="Skin, shadow, weight, shape. A fade is not one setting on a clipper. The important part is where the transition sits against your head shape and how it grows after ten days."/></div><div className="fade-head"><Image src={looks[5].image} alt="Fade detail" fill/><div className="fade-lines"><i/><i/><i/><span>WEIGHT</span><span>BLEND</span><span>EDGE</span></div></div></section>
<section className="svc-beard"><div className="beard-image"><Image src={media.chair} alt="Beard service" fill/></div><div className="beard-copy"><span>05 / BEARD STORY</span><h2>KEEP THE<br/><em>BEARD.</em><br/>LOSE THE<br/>NOISE.</h2><p>We shape around density, jawline and how you actually wear it — not around a generic beard diagram.</p><div><span>30 MIN</span><span>FROM £24</span></div><button onClick={()=>booking.setService(serviceAt(2))}>SELECT BEARD DETAIL </button></div></section>
<section className="svc-split"><div className="split-top"><span>06 / CUT + BEARD</span><h2>ONE APPOINTMENT.<br/><em>TWO SYSTEMS.</em></h2></div><div className="split-process"><article><span>00–45</span><b>HAIR</b><p>Consult, cut, detail, shape.</p></article><article><span>35–60</span><b>BEARD</b><p>Overlap the thinking, not the quality.</p></article><div className="split-cross">+</div></div><Link href="/booking" onClick={()=>booking.setService(serviceAt(1))}>RESERVE 60 MINUTES </Link></section>
<section className="svc-restyle"><div className="restyle-word"><span>07 / RESTYLE</span><h2>BEFORE</h2><h2><em>AFTER.</em></h2></div><div className="restyle-images"><motion.div tabIndex={0} onMouseEnter={()=>setRestyle(0)} onFocus={()=>setRestyle(0)} onClick={()=>setRestyle(0)} animate={{flex:restyle===0?1.65:1}} transition={{duration:.45,ease:[.16,1,.3,1]}}><Image src={media.looks[4]} alt="Before restyle" fill/><span>GROWTH / WEIGHT / NO PLAN</span></motion.div><motion.div tabIndex={0} onMouseEnter={()=>setRestyle(1)} onFocus={()=>setRestyle(1)} onClick={()=>setRestyle(1)} animate={{flex:restyle===1?1.65:1}} transition={{duration:.45,ease:[.16,1,.3,1]}}><Image src={media.hero} alt="After restyle" fill/><span>SHAPE / MOVEMENT / DIRECTION</span></motion.div></div></section>
<section className="svc-length"><div><span>08 / HAIR LENGTH</span><h2>HOW MUCH<br/><em>HAIR ARE WE<br/>WORKING WITH?</em></h2></div><div className="length-control"><div className="length-figure"><motion.div animate={{height:[130,210,310][length]}}><Image src={lengthBarber?.portrait||media.portraits[1]} alt="Hair length reference" fill/></motion.div><span>{['SHORT','MEDIUM','LONG'][length]}</span></div><input aria-label="Hair length" type="range" min="0" max="2" value={length} onChange={e=>setLength(Number(e.target.value))}/><div className="length-labels"><span>SHORT</span><span>MEDIUM</span><span>LONG</span></div><p>{['Signature Cut is the clean starting point.','Signature Cut or a scissor-led appointment both work.','Book Long / Scissor Work so there is enough time for weight and movement.'][length]}</p></div></section>
<Matcher services={services}/>
<section className="svc-compare"><span>10 / COMPARE TIME</span><h2>BOOK ENOUGH<br/><em>TIME.</em></h2><div>{services.slice(0,4).map(s=><article key={s._id}><b>{s.name}</b><motion.i initial={{scaleX:0}} whileInView={{scaleX:s.duration/70}} viewport={{once:true}} transition={{duration:.8}}/><span>{s.duration} MIN</span><small>£{s.price}</small></article>)}</div></section>
<section className="svc-results"><div className="section-index inverse"><span>11</span><b>WHAT THE TIME BECOMES</b><small>RECENT RESULT STUDIES</small></div>{looks.slice(0,4).map((l,i)=><figure key={l.id} className={`result-${i+1}`}><Image src={l.image} alt={l.title} fill/><figcaption><span>{l.category}</span><b>{l.title}</b><small>BY {l.barber.name}</small></figcaption></figure>)}</section>
<section className="svc-final"><span>12 / BOOKING FINALE</span><h2><RevealText>CHOOSE THE TIME.</RevealText><br/><em><RevealText>WE'LL HANDLE THE DETAIL.</RevealText></em></h2><p>Still unsure? Book the closest service and leave a note. Your barber can adjust the plan when you sit down.</p><Link href="/booking">BUILD YOUR APPOINTMENT </Link></section>
</main>}
