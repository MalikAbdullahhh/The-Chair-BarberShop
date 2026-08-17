"use client";
import {EditorialImage as Image} from "@/components/media/EditorialImage";import Link from "next/link";import {useEffect,useMemo,useRef,useState} from "react";import {AnimatePresence,motion,useMotionValue,useScroll,useSpring,useTransform} from "framer-motion";import {ArrowDownRight,ArrowUpRight,Play} from "lucide-react";import {api} from "@/lib/api";import {media} from "@/data/media";import {barbers,looks,services,journal} from "@/data/site";import {useBooking} from "@/components/providers/BookingProvider";import {RevealLines,RevealText} from "@/components/motion/RevealText";import {ParallaxMedia} from "@/components/motion/ParallaxMedia";import {ScrollWords} from "@/components/motion/ScrollWords";import {Magnetic} from "@/components/motion/Magnetic";import {Typewriter} from "@/components/motion/Typewriter";import {usePublicData} from "@/components/providers/PublicDataProvider";import {useDesktopMotion} from "@/components/motion/useMotionMode";

function Hero(){
  const desktop=useDesktopMotion();
  const {content}=usePublicData();
  const c=content["home.hero"];
  const title=String(c?.title||"TAKE YOUR CHAIR.").split(/\s+/);
  const lastTitle=title[title.length-1]||"CHAIR.";
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end start"]});
  const smoothProgress=useSpring(scrollYProgress,{stiffness:55,damping:20,mass:0.2,restDelta:0.001});
  const scale=useTransform(smoothProgress,[0,1],[1,.86]);
  const radius=useTransform(smoothProgress,[0,1],[0,28]);
  const yTitle=useTransform(smoothProgress,[0,1],[0,-90]);
  const yMeta=useTransform(smoothProgress,[0,1],[0,50]);
  return (
    <section ref={ref} className="h-hero-wrap">
      <motion.div className="h-hero" style={desktop?{scale,borderRadius:radius}:undefined}>
        <Image src={media.hero} alt="Barber at work" fill priority sizes="100vw"/>
        <div className="h-hero-vignette"/>
        <div className="h-hero-top">
          <span>{c?.eyebrow||"01 / ARRIVAL"}</span>
          <span>HOUSE MODE / <Typewriter words={["CUT","DETAIL","RESET","RESTYLE"]}/></span>
        </div>
        <motion.h1 style={desktop?{y:yTitle}:undefined}>
          <RevealLines lines={[title.slice(0,-1).join(" ")||"TAKE YOUR"]}/>
          <em><RevealLines lines={[lastTitle]}/></em>
        </motion.h1>
        <motion.p style={desktop?{y:yMeta}:undefined}>
          {c?.copy||<>A private grooming experience,<br/>built around your time.</>}
        </motion.p>
        <motion.div className="h-hero-next" style={desktop?{y:yMeta}:undefined}>
          <small>NEXT CHAIR / TODAY</small>
          <strong>17:30</strong>
          <Link href="/booking" data-cursor="BOOK">BOOK 17:30 <ArrowUpRight size={18}/></Link>
        </motion.div>
        <div className="scroll-cue">
          <span>SCROLL TO ENTER</span>
          <ArrowDownRight size={18}/>
        </div>
      </motion.div>
    </section>
  );
}

function LiveBoard(){const booking=useBooking();const {barbers,services}=usePublicData();const [remote,setRemote]=useState<any[]>([]);useEffect(()=>{api<any>("/public/next-chairs").then(x=>setRemote(x.items||[])).catch(()=>{})},[]);const rows=(remote.length?remote:barbers.slice(0,4).map((barber,i)=>({barber,service:services[i%services.length],time:["17:30","18:00","18:15","18:45"][i],date:"TODAY"})));return <section className="h-board"><div className="section-index"><span>02</span><b>LIVE CHAIR BOARD</b><small>REAL-TIME WHEN API IS CONNECTED</small></div><div className="board-title"><h2>NEXT<br/><em>CHAIRS</em></h2><p>Start with time. Everything else can follow.</p></div><div className="board-table">{rows.map((r:any,i)=><motion.button key={`${r.barber._id}-${i}`} className="live-row" initial="rest" whileHover="hover" onClick={()=>{booking.setBarber(r.barber);booking.setService(r.service);booking.setTime(r.time);if(r.date!=="TODAY")booking.setDate(r.date)}}><span className="live-time">{r.time}</span><span className="live-barber"><b>{r.barber.name}</b><small>CHAIR {r.barber.chairNumber}</small></span><span className="live-service">{r.service.name}<small>{r.service.duration} MIN / £{r.service.price}</small></span><motion.span className="live-action" variants={{rest:{x:24,opacity:0},hover:{x:0,opacity:1}}}>TAKE IT </motion.span><motion.div className="live-preview" variants={{rest:{clipPath:'inset(100% 0 0 0)'},hover:{clipPath:'inset(0% 0 0 0)'}}}><Image src={r.barber.portrait||media.portraits[i]} alt={r.barber.name} fill/></motion.div></motion.button>)}</div></section>}

function Manifesto(){
  const desktop=useDesktopMotion();
  const {content}=usePublicData();
  const c=content["home.manifesto"];
  const mt=String(c?.title||"NOT JUST A HAIRCUT.").split(" ");
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
  const smoothProgress=useSpring(scrollYProgress,{stiffness:55,damping:20,mass:0.2,restDelta:0.001});
  const x1=useTransform(smoothProgress,[0,1],[-60,80]);
  const x2=useTransform(smoothProgress,[0,1],[60,-80]);
  return (
    <section ref={ref} className="h-manifesto">
      <div className="manifesto-sticky">
        <motion.h2 style={desktop?{x:x1}:undefined}>{mt.slice(0,-1).join(" ")}</motion.h2>
        <motion.h2 className="serif-line" style={desktop?{x:x2}:undefined}>{mt[mt.length-1]}</motion.h2>
        <ScrollWords text={c?.copy||"Forty-five minutes. One barber. Zero rush. The appointment starts with a conversation and ends when the detail is right — not when a card reader says the slot is over."}/>
        <div className="manifesto-metric"><span>45</span><b>MINUTES<br/>RESERVED<br/>FOR YOU.</b></div>
      </div>
    </section>
  );
}

function ServiceLedger(){const b=useBooking();const {services}=usePublicData();const [active,setActive]=useState(0);const current=services[active]||services[0];return <section className="h-ledger"><div className="section-index inverse"><span>04</span><b>THE SERVICE LEDGER</b><small>NO PACKAGES. NO NOISE.</small></div><div className="ledger-media"><AnimatePresence mode="wait"><motion.div key={active} initial={{clipPath:'inset(0 100% 0 0)',scale:1.08}} animate={{clipPath:'inset(0 0% 0 0)',scale:1}} exit={{clipPath:'inset(0 0 0 100%)'}} transition={{duration:.55,ease:[.76,0,.24,1]}}><Image src={current?.image||media.detail} alt={current?.name||"Service"} fill/></motion.div></AnimatePresence><span>{String(active+1).padStart(2,'0')} / {String(services.length).padStart(2,'0')}</span></div><div className="ledger-list">{services.map((s,i)=><motion.button key={s._id} className={i===active?'active':''} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>{setActive(i);b.setService(s)}} layout><span>{String(i+1).padStart(2,'0')}</span><b>{s.name}</b><small>{s.duration} MIN</small><em>FROM £{s.price}</em><i>SELECT </i></motion.button>)}</div></section>}

function ChairMap(){const b=useBooking();const {barbers}=usePublicData();const [active,setActive]=useState(0);const current=barbers[active]||barbers[0];return <section className="h-chairmap"><div className="chairmap-copy"><span className="eyebrow">05 / SELECT A CHAIR</span><h2>FOUR CHAIRS.<br/><em>FOUR POINTS<br/>OF VIEW.</em></h2><p>Choose by specialty, by person, or leave it open and take the first available hand.</p><div className="chair-selected"><span>ACTIVE / {current?.chairNumber||"--"}</span><b>{current?.name||"FIRST AVAILABLE"}</b><small>{current?.specialties?.join(' / ')||'ANY SPECIALTY'}</small></div></div><div className="studio-plan"><div className="plan-wall wall-a"/><div className="plan-wall wall-b"/><span className="plan-label label-a">ENTRY</span><span className="plan-label label-b">WASH</span>{barbers.map((x,i)=><motion.button key={x._id} className={`plan-chair chair-${i+1} ${active===i?'active':''}`} onMouseEnter={()=>setActive(i)} onClick={()=>{setActive(i);b.setBarber(x)}} whileHover={{scale:1.07,rotate:i%2?-2:2}} data-cursor="MEET"><i/><span>{x.chairNumber}</span><b>{x.name.split(' ')[0]}</b></motion.button>)}<motion.div className="plan-portrait" layoutId="planPortrait"><Image src={barbers[active].portrait||media.portraits[active]} alt={current?.name||"FIRST AVAILABLE"} fill/></motion.div></div></section>}

function BarberStory(){
  const desktop = useDesktopMotion();
  const booking = useBooking();
  const { barbers } = usePublicData();
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  const smoothX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.2,
    restDelta: 0.001
  });

  const x = useTransform(smoothX, [0, 1], ["0%", `-${(Math.max(1, barbers.length) - 1) * 25 * (100 / 25)}%`].length ? ["0%", `-${(Math.max(1, barbers.length) - 1) * 25}%`] : ["0%", "-75%"]);
  const progressScale = useTransform(smoothX, [0, 1], [0.25, 1]);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const idx = Math.min(barbers.length - 1, Math.floor(latest * barbers.length));
      setActiveIdx(idx);
    });
  }, [scrollYProgress, barbers.length]);

  const scrollToChair = (idx: number) => {
    if (!ref.current) return;
    const top = ref.current.offsetTop;
    const height = ref.current.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + (idx / Math.max(1, barbers.length - 1)) * height,
      behavior: "smooth"
    });
  };

  return (
    <section ref={ref} className="h-barber-scroll">
      <div className="barber-pin">
        <div className="section-index barber-header-row">
          <div className="b-header-left">
            <span>06</span>
            <b>BEHIND THE CHAIR</b>
            <small>FOUR PERSPECTIVES / HORIZONTAL STUDY</small>
          </div>
          <div className="b-header-right">
            <div className="barber-tabs">
              {barbers.map((b, i) => (
                <button
                  key={b._id}
                  type="button"
                  className={activeIdx === i ? "active" : ""}
                  onClick={() => scrollToChair(i)}
                >
                  <span>{b.chairNumber}</span> {b.name.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="barber-progress-rail">
              <motion.div className="barber-progress-bar" style={{ scaleX: progressScale }} />
            </div>
          </div>
        </div>

        <motion.div className="barber-track" style={desktop ? { x } : undefined}>
          {barbers.map((barber, i) => (
            <article className={`barber-scene ${activeIdx === i ? "is-current" : ""}`} key={barber._id}>
              <div className="barber-scene-image" data-cursor="MEET">
                <Image
                  src={barber.portrait || media.portraits[i % media.portraits.length]}
                  alt={barber.name}
                  fill
                  sizes="(max-width: 900px) 90vw, 45vw"
                />
                <div className="barber-scene-badge">
                  <span>CHAIR {barber.chairNumber}</span>
                  <small>{barber.specialties[0] || "SPECIALIST"}</small>
                </div>
              </div>
              <div className="barber-scene-copy">
                <div className="scene-meta">
                  <small>PERSPECTIVE {String(i + 1).padStart(2, "0")} / {String(barbers.length).padStart(2, "0")}</small>
                  <span>STATION 0{barber.chairNumber}</span>
                </div>
                <h3>
                  {barber.name.split(" ")[0]}
                  <br />
                  <em>{barber.name.split(" ")[1] || "THE CHAIR"}</em>
                </h3>
                <p>{barber.bio}</p>
                <div className="scene-specialties">
                  {barber.specialties.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="scene-actions">
                  <Link href={`/barbers/${barber.slug}`} className="scene-profile-link">
                    MEET {barber.name.split(" ")[0]} <ArrowUpRight size={15} />
                  </Link>
                  <button
                    type="button"
                    className="scene-select-btn"
                    onClick={() => booking.setBarber(barber)}
                  >
                    SELECT CHAIR {barber.chairNumber}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


function Transformation(){
  const [active, setActive] = useState<number>(0);

  const stages = [
    {
      step: "01",
      title: "ARRIVE",
      subtitle: "CONSULTATION & TIME",
      copy: "We start before the scissors. What works, what does not, what you want to stop thinking about.",
      image: media.chair,
      alt: "The Chair studio interior and leather barber chair"
    },
    {
      step: "02",
      title: "PROCESS",
      subtitle: "PRECISION & CRAFT",
      copy: "No production line. The pace changes with the cut, Japanese steel shears and focused craft.",
      image: media.tools,
      alt: "Barber craft tools, steel scissors and razors"
    },
    {
      step: "03",
      title: "LEAVE",
      subtitle: "WEAR IT TOMORROW",
      copy: "You should understand how to wear it tomorrow, not only how it looked in the chair.",
      image: media.looks[0] || media.detail,
      alt: "Finished haircut style and tailored grooming"
    }
  ];

  return (
    <section className="h-transform">
      <div className="section-index">
        <span>07</span>
        <b>THE APPOINTMENT</b>
        <small>ARRIVE / PROCESS / LEAVE</small>
      </div>
      <div className="transform-panels">
        {stages.map((st, i) => (
          <article
            key={st.step}
            className={`transform-card ${active === i ? "is-active" : ""}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <div className="transform-img-wrap">
              <Image
                src={st.image}
                alt={st.alt}
                fill
                sizes="(max-width: 768px) 85vw, 33vw"
                className="transform-bg-img"
              />
            </div>
            <div className="transform-shade" />
            <div className="transform-top">
              <span className="transform-step">{st.step}</span>
              <small className="transform-phase">{st.subtitle}</small>
            </div>
            <div className="transform-content">
              <b>{st.title}</b>
              <p>{st.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}



function ContactSheet(){return <section className="h-contact-sheet"><div className="section-index inverse"><span>08</span><b>CRAFT / CLOSE UP</b><small>THE PART PEOPLE MISS</small></div><div className="contact-grid">{[media.tools,media.detail,media.towel,media.chair,media.product,...media.looks.slice(0,4)].map((src,i)=><motion.figure key={`${src}-${i}`} className={`contact-${i+1}`} whileHover={{zIndex:10}} data-cursor="VIEW"><motion.div whileHover={{scale:1.08}} transition={{duration:.6,ease:[.16,1,.3,1]}}><Image src={src} alt="The Chair craft detail" fill/></motion.div><figcaption><span>FRAME {String(i+1).padStart(2,'0')}</span><b>{['STEEL','EDGE','CLOTH','STATION','FINISH','TEXTURE','LINE','WEIGHT','FORM'][i]}</b></figcaption></motion.figure>)}</div></section>}

function ServiceBuilder(){const b=useBooking();const {services,barbers}=usePublicData();const [index,setIndex]=useState(0);const serviceAt=(i:number)=>services[i%Math.max(services.length,1)]||services[0];const options=[['HAIR',0],['BEARD',2],['BOTH',1],['RESTYLE',3],['NOT SURE',0]] as const;const chosen=serviceAt(options[index][1]);return <section className="h-builder"><div className="builder-question"><span>09 / BUILD IT</span><h2>WHAT ARE WE<br/><em>DOING TODAY?</em></h2><p>No quiz. No fake AI. Just enough information to get you to the right amount of time.</p></div><div className="builder-options">{options.map(([label],i)=><motion.button key={label} className={i===index?'active':''} onClick={()=>{setIndex(i);b.setService(serviceAt(options[i][1]))}} layout><span>{String(i+1).padStart(2,'0')}</span><b>{label}</b><i>{i===index?'':''}</i></motion.button>)}</div><motion.aside layout className="builder-result"><small>WE'D START WITH</small><strong>{chosen?.name||"SIGNATURE CUT"}</strong><p>{chosen?.description||"Choose the amount of time that best fits the change you want."}</p><div><span>{chosen?.duration||45} MIN</span><span>FROM £{chosen?.price||32}</span><span>{barbers.length} BARBERS</span></div><Link href="/booking">BUILD MY APPOINTMENT </Link></motion.aside></section>}

function Atmosphere(){
  const desktop=useDesktopMotion();
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
  const smoothProgress=useSpring(scrollYProgress,{stiffness:50,damping:20,mass:0.2,restDelta:0.001});
  const scale=useTransform(smoothProgress,[0,.5,1],[1.08,1,1.06]);
  const letter=useTransform(smoothProgress,[0,.5,1],[".04em","-.02em",".01em"]);
  return (
    <section ref={ref} className="h-atmosphere">
      <motion.div style={desktop?{scale}:undefined}>
        <Image src={media.house} alt="Inside The Chair" fill/>
      </motion.div>
      <div className="atmo-shade"/>
      <motion.h2 style={desktop?{letterSpacing:letter}:undefined}>
        COME IN.<br/>SLOW DOWN.<br/><em>TAKE THE CHAIR.</em>
      </motion.h2>
      <div className="film-control" aria-label="House film duration">
        <Play size={16}/> HOUSE FILM / 00:34
      </div>
    </section>
  );
}

function WorkWall(){const {lookbook:looks}=usePublicData();const [active,setActive]=useState<string|null>(null);return <section className="h-work"><div className="work-head"><span>11 / RECENT WORK</span><h2>NOT A STYLE<br/><em>CATALOGUE.</em></h2><p>Reference the shape, the texture, the mood. Your barber translates it to your hair.</p><Link href="/lookbook">OPEN THE LOOKBOOK </Link></div><div className="work-masonry">{looks.map((look,i)=><motion.button key={look.id} className={`work-card wc-${i+1}`} onClick={()=>setActive(look.id)} whileHover={{y:-8}} data-cursor="VIEW"><Image src={look.image} alt={look.title} fill/><span>{look.category}</span><b>{look.title}</b></motion.button>)}</div><AnimatePresence>{active&&<motion.div className="quick-look" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setActive(null)}><motion.div initial={{y:70,scale:.95}} animate={{y:0,scale:1}} exit={{y:70,scale:.95}} onClick={e=>e.stopPropagation()}>{(()=>{const l=looks.find(x=>x.id===active)!;return <><div className="quick-image"><Image src={l.image} alt={l.title} fill/></div><div className="quick-copy"><button onClick={()=>setActive(null)}>CLOSE </button><small>{l.category} / {l.barber.name}</small><h3>{l.title}</h3><p>Bring the reference. We will talk through what translates to your growth pattern, density and routine.</p><Link href="/booking">BOOK THIS LOOK </Link></div></>})()}</motion.div></motion.div>}</AnimatePresence></section>}

function QuoteStage(){const {reviews}=usePublicData();const quote=reviews[0];const rawX=useMotionValue(0);const sx=useSpring(rawX,{stiffness:150,damping:22});return <section className="h-quote"><span>12 / CLIENT NOTE</span><motion.div drag="x" dragConstraints={{left:-180,right:180}} style={{x:sx}} onDrag={(_,i)=>rawX.set(i.offset.x*.08)} data-cursor="DRAG"><h2>{quote?<>{`“${quote.quote.toUpperCase()}`}</>:<>“THE FIRST<br/>BARBER WHO<br/><em>ACTUALLY LISTENED.</em>”</>}</h2><p>{quote?`${quote.name.toUpperCase()} / ${quote.service||"CLIENT NOTE"}`:"JAMES R. / CUT + BEARD / CHAIR 03"}</p></motion.div><small>DRAG THE NOTE</small></section>}

function HouseReveal(){
  const desktop = useDesktopMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.35"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 55, damping: 22, mass: 0.2, restDelta: 0.001 });
  const clip = useTransform(smoothProgress, [0, 0.6, 1], ["inset(24% 18% 24% 18%)", "inset(4% 4% 4% 4%)", "inset(0% 0% 0% 0%)"]);
  const opacity = useTransform(smoothProgress, [0, 0.4], [0.5, 1]);

  return (
    <section ref={ref} className="h-house-reveal">
      <svg className="house-drawing" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <motion.path
          d="M120 500V130H820V500M120 220H820M330 130V500M610 130V500M820 300H930V500H820M45 500H955"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <motion.div className="house-photo" style={desktop ? { clipPath: clip, opacity } : undefined}>
        <Image src={media.exterior} alt="The Chair exterior architecture" fill sizes="100vw" />
        <div className="house-photo-shade" />
      </motion.div>
      <div className="house-copy">
        <div className="house-copy-badge">
          <span>13 / THE HOUSE</span>
        </div>
        <h2>
          BUILT AROUND<br />
          <em>THE CHAIR.</em>
        </h2>
        <p>14 King Street. High ceilings, heritage joinery, acoustic privacy, and private wash basins.</p>
        <Link href="/house" data-cursor="ENTER">
          ENTER THE HOUSE <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function Membership(){return <section className="h-membership"><div className="member-copy"><span>14 / MEMBERSHIP</span><h2>ONE LESS<br/>THING TO<br/><em>THINK ABOUT.</em></h2><p>Choose the rhythm once. Keep the same barber, the same standard and priority access to the times you actually use.</p><Link href="/membership">FIND YOUR RHYTHM </Link></div><div className="rhythm-track">{[1,2,3,4,5,6,7,8].map((n)=><div key={n} className={n===1||n===4||n===7?'hit':''}><span>WEEK {String(n).padStart(2,'0')}</span>{n===1&&<b>FULL CUT</b>}{n===4&&<b>REFRESH</b>}{n===7&&<b>RESET</b>}</div>)}</div></section>}

function JournalPreview(){const {journal}=usePublicData();return <section className="h-journal"><div className="section-index"><span>15</span><b>THE JOURNAL</b><small>NOT CONTENT. USEFUL NOTES.</small></div><div className="journal-feature"><div className="journal-image"><Image src={journal[0].cover||media.detail} alt={journal[0].title} fill/></div><span>{journal[0].type}</span><h2>{journal[0].title}</h2><p>{journal[0].excerpt}</p><Link href="/journal">READ FIELD NOTES </Link></div><div className="journal-side">{journal.slice(1).map((j,i)=><Link href="/journal" key={j.slug}><span>0{i+2} / {j.type}</span><b>{j.title}</b><i></i></Link>)}</div></section>}

function Visit(){
  const desktop = useDesktopMotion();
  const { settings } = usePublicData();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20, mass: 0.2, restDelta: 0.001 });
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.08, 1, 1.06]);

  return (
    <section ref={ref} className="h-visit">
      <div className="visit-image-wrap">
        <motion.div className="visit-image" style={desktop ? { scale } : undefined}>
          <Image
            src={media.exterior}
            alt="The Chair entrance at 14 King Street"
            fill
            sizes="50vw"
          />
          <div className="visit-image-shade" />
        </motion.div>
      </div>

      <div className="visit-panel">
        <span className="visit-eyebrow">16 / VISIT THE HOUSE</span>
        <h2>
          STREET<br />
          &bull; BUILDING<br />
          <em>&bull; ENTRANCE.</em>
        </h2>
        <p className="visit-address-text">{settings?.address || "14 KING STREET, MANCHESTER M2 4WU"}</p>
        <div className="visit-hours-row">
          <div className="visit-hour-item">
            <small>WEEKDAYS</small>
            <b>MON–FRI / 09:00–20:00</b>
          </div>
          <div className="visit-hour-item">
            <small>WEEKENDS</small>
            <b>SATURDAY / 09:00–18:00</b>
          </div>
        </div>
        <Link href="/visit" className="visit-action-btn" data-cursor="FIND">
          <span>FIND THE DOOR & DIRECTIONS</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}


function FinalCTA(){const {content}=usePublicData();const c=content["home.final"];const ft=String(c?.title||"YOUR CHAIR IS WAITING.").split(" ");return <section className="h-final"><span>{c?.eyebrow||"17 / YOUR NEXT CHAIR"}</span><h2><RevealText>{ft.slice(0,2).join(" ")}</RevealText><br/><em><RevealText>{ft.slice(2).join(" ")}</RevealText></em></h2><div className="final-meta"><span><small>TODAY</small><b>17:30</b></span><span><small>WITH</small><b>JACK</b></span></div><Magnetic><Link className="final-book" href="/booking" data-cursor="BOOK">TAKE 17:30 <ArrowUpRight/></Link></Magnetic></section>}

export function HomeExperience(){return <main className="home-v2"><Hero/><LiveBoard/><Manifesto/><ServiceLedger/><ChairMap/><BarberStory/><Transformation/><ContactSheet/><ServiceBuilder/><Atmosphere/><WorkWall/><QuoteStage/><HouseReveal/><Membership/><JournalPreview/><Visit/><FinalCTA/></main>}
