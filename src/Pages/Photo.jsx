import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ArrowUpRight, MoveRight } from "lucide-react";
import roomImg from "../assets/room.png";
import "../Photo.css";

const EASE = [0.16, 1, 0.3, 1];

/* ------------------------------------------------------------------ */
/* Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Label({ children, className = "" }) {
  return (
    <p
      className={`text-[10px] font-semibold uppercase tracking-[0.34em] ${className}`}
    >
      {children}
    </p>
  );
}

function Reveal({ children, className = "", delay = 0, y = 26 }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word masked reveal for editorial statements. */
function Statement({ text, className = "" }) {
  const words = text.split(" ");

  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-16% 0px" }}
      variants={{ show: { transition: { staggerChildren: 0.032 } } }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="mr-[0.24em] inline-block overflow-hidden pb-[0.09em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "115%", rotate: 2.5 },
              show: {
                y: 0,
                rotate: 0,
                transition: { duration: 0.85, ease: EASE },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Page scroll progress                                            */
/* ------------------------------------------------------------------ */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-room-gold"
    />
  );
}

/* ------------------------------------------------------------------ */
/* 2. Hero                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);

  const mx = useMotionValue(30);
  const my = useMotionValue(32);
  const spotlight = useMotionTemplate`radial-gradient(44rem circle at ${mx}% ${my}%, rgba(247,181,56,0.24), transparent 62%)`;

  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set(((event.clientX - rect.left) / rect.width) * 100);
    my.set(((event.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <section
      ref={ref}
      onPointerMove={handlePointerMove}
      className="room-grain relative h-svh min-h-[640px] overflow-hidden bg-room-ink text-room-cream"
    >
      {/* Photograph + parallax */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y: imageY, scale: imageScale }}
      >
        <img
          src={roomImg}
          alt="A 1970s living room wrapped in warm plaster and late afternoon light"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Tonal overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-room-ink/75 via-room-ink/15 to-room-ink/90" />
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_0%,transparent_18%,rgba(11,26,28,0.58)_100%)]" />
      <motion.div
        aria-hidden
        style={{ backgroundImage: spotlight }}
        className="pointer-events-none absolute inset-0 hidden md:block"
      />

      {/* Top meta row */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-[var(--page-x)] pt-7">
        <Label className="text-room-gold">Photo Study — N° 01</Label>
        <Label className="hidden text-room-cream/55 sm:block">
          Living room / 1974
        </Label>
      </div>

      {/* Title */}
      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: EASE }}
          className="mb-5 text-[10px] uppercase tracking-[0.5em] text-room-gold sm:mb-7"
        >
          A study in light &amp; stillness
        </motion.p>

        <h1 className="font-display uppercase leading-[0.8] tracking-[-0.035em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              initial={{ y: "112%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.24, duration: 1.15, ease: EASE }}
              className="block text-[clamp(3rem,11vw,9.5rem)] font-medium"
            >
              The
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
              initial={{ y: "112%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.36, duration: 1.15, ease: EASE }}
              className="block text-[clamp(4.1rem,15vw,13rem)] italic text-room-bright"
            >
              Room
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: EASE }}
          className="mt-6 max-w-md text-sm font-light leading-relaxed text-room-cream/70 sm:text-base"
        >
          An afternoon held still — terrazzo light, warm timber, and a chair
          angled toward the window.
        </motion.p>
      </motion.div>

      {/* Bottom meta row */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-[var(--page-x)] pb-7">
        <p className="max-w-[13rem] text-[10px] uppercase leading-relaxed tracking-[0.24em] text-room-cream/45">
          Scroll to walk through the frame
        </p>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-room-cream/55">
            Scroll
          </span>
          <span className="relative h-px w-16 overflow-hidden bg-room-cream/25">
            <motion.span
              aria-hidden
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-room-bright"
            />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Manifesto                                                       */
/* ------------------------------------------------------------------ */

function Manifesto() {
  return (
    <section className="relative bg-room-cream px-[var(--page-x)] py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <Reveal>
              <Label className="text-room-teal">01 — The Space</Label>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[19rem] text-sm leading-relaxed text-room-ink/60">
                Photographed on a Tuesday, just before the light turned amber.
                Nothing was arranged — the room had already arranged itself.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <dl className="space-y-3 border-t border-room-ink/15 pt-5 text-[11px]">
              {[
                ["Photograph", "Room N° 01"],
                ["Light", "Late afternoon"],
                ["Palette", "Plaster, timber, coral"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-baseline justify-between gap-4">
                  <dt className="uppercase tracking-[0.22em] text-room-ink/45">
                    {term}
                  </dt>
                  <dd className="text-room-ink/75">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div>
          <Statement
            text="Some rooms ask you to sit down. This one asks you to stay — late light on warm plaster, a chair that remembers your shape, a small architecture of calm."
            className="font-display text-[clamp(1.9rem,4.1vw,3.7rem)] font-normal leading-[1.06] tracking-[-0.02em]"
          />

          <Reveal delay={0.25} className="mt-10 flex items-center gap-4">
            <span className="room-hairline h-px flex-1" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-room-ink/40">
              A room in repose
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Marquee strip                                                   */
/* ------------------------------------------------------------------ */

const MARQUEE_WORDS = ["Light", "Shadow", "Timber", "Stillness", "Amber", "Quiet"];

function Marquee() {
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-room-ink/15 bg-room-cream py-5 sm:py-7"
    >
      <div className="room-marquee flex w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {MARQUEE_WORDS.map((word) => (
              <span
                key={`${copy}-${word}`}
                className="flex items-center font-display text-[clamp(2rem,4.6vw,4.4rem)] uppercase leading-none tracking-[-0.02em] text-room-ink/85"
              >
                {word}
                <span className="mx-6 inline-block h-[7px] w-[7px] rotate-45 bg-room-gold sm:mx-9" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Sticky portal — the photograph opens on scroll                  */
/* ------------------------------------------------------------------ */

function Portal() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const frameScale = useTransform(scrollYProgress, [0, 0.72], [0.62, 1]);
  const frameRotate = useTransform(scrollYProgress, [0, 0.72], [5, 0]);
  const frameY = useTransform(scrollYProgress, [0, 0.72], [46, 0]);
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    [1.34, 1.03, 1.12]
  );
  const wordX = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.36], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const endOpacity = useTransform(scrollYProgress, [0.72, 0.94], [0, 1]);

  return (
    <section ref={ref} className="relative h-[290svh] bg-room-ink text-room-cream">
      <div className="room-grain sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        {/* Giant outlined word */}
        <motion.span
          aria-hidden
          style={reduced ? undefined : { x: wordX }}
          className="room-outline pointer-events-none absolute select-none font-display text-[38vw] uppercase leading-none"
        >
          Room
        </motion.span>

        {/* Floating labels */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-[var(--page-x)] pt-7">
          <Label className="text-room-gold">02 — The Portal</Label>
          <Label className="hidden text-room-cream/45 sm:block">
            Scroll to open the frame
          </Label>
        </div>

        {/* Frame */}
        <motion.div
          style={
            reduced
              ? undefined
              : { scale: frameScale, rotate: frameRotate, y: frameY }
          }
          className="relative z-10 w-[92vw] max-w-[1040px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        >
          {/* gilded frame */}
          <div className="bg-gradient-to-br from-[#efd18c] via-room-gold to-[#a97a25] p-[7px] sm:p-[10px]">
            <div className="relative aspect-[4/3] overflow-hidden bg-room-ink sm:aspect-[16/10]">
              <motion.img
                src={roomImg}
                alt="Close view of the living room"
                style={reduced ? undefined : { scale: imageScale }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-room-ink/85 via-transparent to-room-ink/10" />

              <motion.div
                style={reduced ? undefined : { opacity: captionOpacity }}
                className="absolute inset-x-0 bottom-0 p-5 sm:p-8"
              >
                <Label className="text-room-bright">N° 01 — Living room</Label>
                <p className="mt-2 font-display text-2xl leading-tight text-room-cream sm:text-4xl">
                  Late afternoon, no one home.
                </p>
              </motion.div>
            </div>
          </div>

          {/* corner brackets */}
          {[
            "-top-3 -left-3 border-t border-l",
            "-top-3 -right-3 border-t border-r",
            "-bottom-3 -left-3 border-b border-l",
            "-bottom-3 -right-3 border-b border-r",
          ].map((position) => (
            <span
              key={position}
              aria-hidden
              className={`absolute h-5 w-5 border-room-bright ${position}`}
            />
          ))}
        </motion.div>

        {/* End caption */}
        <motion.p
          style={reduced ? undefined : { opacity: endOpacity }}
          className="absolute inset-x-0 bottom-16 z-20 text-center text-[10px] uppercase tracking-[0.4em] text-room-bright"
        >
          The room opens
        </motion.p>

        {/* Scroll cue + progress */}
        <motion.div
          style={reduced ? undefined : { opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-[0.32em] text-room-cream/50">
            Enter
          </span>
          <span className="relative h-px w-28 overflow-hidden bg-room-cream/20">
            <motion.span
              style={{ scaleX: scrollYProgress }}
              className="absolute inset-0 origin-left bg-room-bright"
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Horizontal pinned gallery                                       */
/* ------------------------------------------------------------------ */

const DETAILS = [
  {
    title: "The Chair",
    meta: "Coral / swivel",
    copy: "A single coral note in a room of neutrals, angled toward the window.",
    position: "22% 58%",
    zoom: 2.55,
  },
  {
    title: "The Sofa",
    meta: "Cream / curved",
    copy: "Curved, low, and built for conversations that outlast the afternoon.",
    position: "41% 55%",
    zoom: 2.2,
  },
  {
    title: "The Desk",
    meta: "Mustard / 1974",
    copy: "Work waits quietly beneath a framed landscape and a tired desk lamp.",
    position: "77% 52%",
    zoom: 2.35,
  },
  {
    title: "The Screen",
    meta: "Black / switched off",
    copy: "A dark mirror on a low table, holding the only reflection in the room.",
    position: "52% 82%",
    zoom: 2.6,
  },
  {
    title: "The Light",
    meta: "Brass / paper moon",
    copy: "Two pendants and a paper moon, keeping the ceiling from going quiet.",
    position: "84% 22%",
    zoom: 2.7,
  },
];

function DetailCard({ item, index }) {
  return (
    <motion.article
      whileHover={{ y: -10 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="group flex h-[56svh] min-h-[340px] max-h-[520px] w-[76vw] shrink-0 flex-col sm:w-[44vw] lg:w-[33vw] xl:w-[29vw]"
    >
      <div className="relative flex-1 overflow-hidden bg-room-ink">
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${item.zoom})`,
            transformOrigin: item.position,
          }}
        >
          <img
            src={roomImg}
            alt={`${item.title} — detail from the room`}
            className="h-full w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-105"
            style={{ objectPosition: item.position }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-room-ink/70 via-transparent to-room-ink/10" />

        <span className="absolute left-4 top-4 font-display text-4xl leading-none text-room-bright sm:text-5xl">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.28em] text-room-cream/70">
          Detail / {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="border-t border-room-ink/20 pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl tracking-[-0.01em] sm:text-2xl">
            {item.title}
          </h3>
          <span className="shrink-0 text-[9px] uppercase tracking-[0.22em] text-room-ink/45">
            {item.meta}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-room-ink/55">
          {item.copy}
        </p>
      </div>
    </motion.article>
  );
}

function Gallery() {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progressX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.3,
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      DETAILS.length,
      Math.max(1, Math.round(value * (DETAILS.length - 1)) + 1)
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () =>
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (reduced) {
    return (
      <section className="bg-room-cream px-[var(--page-x)] py-24">
        <div className="mx-auto max-w-6xl">
          <Label className="text-room-teal">03 — Details</Label>
          <h2 className="mt-3 font-display text-[clamp(2rem,4.5vw,4rem)] leading-none tracking-[-0.02em]">
            Up close, <em>slowly</em>
          </h2>
          <div className="mt-10 flex gap-6 overflow-x-auto pb-6">
            {DETAILS.map((item, index) => (
              <DetailCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={{ height: distance ? `calc(100svh + ${distance}px)` : "320svh" }}
      className="relative bg-room-cream"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 px-[var(--page-x)] pt-8">
          <div>
            <Label className="text-room-teal">03 — Details</Label>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.2vw,3.8rem)] leading-none tracking-[-0.02em]">
              Up close, <em>slowly</em>
            </h2>
          </div>

          <div className="hidden items-center gap-4 pb-1 sm:flex">
            <span className="font-display text-lg tabular-nums text-room-ink/70">
              {String(active).padStart(2, "0")}
              <span className="text-room-ink/35"> / 05</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-room-ink/45">
              Scroll to move
            </span>
            <MoveRight size={18} className="text-room-gold" />
          </div>
        </div>

        {/* Hairline progress */}
        <div className="mt-6 px-[var(--page-x)]">
          <div className="h-px w-full bg-room-ink/15">
            <motion.div
              style={{ scaleX: progressX }}
              className="h-full origin-left bg-room-gold"
            />
          </div>
        </div>

        {/* Track */}
        <div className="flex flex-1 items-center">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex w-max items-start gap-5 px-[var(--page-x)] will-change-transform sm:gap-7"
          >
            {DETAILS.map((item, index) => (
              <DetailCard key={item.title} item={item} index={index} />
            ))}
          </motion.div>
        </div>

        {/* Bottom note */}
        <div className="flex items-center justify-between px-[var(--page-x)] pb-5 text-[10px] uppercase tracking-[0.26em] text-room-ink/40">
          <span>One photograph, five rooms</span>
          <span className="hidden sm:block">Keep scrolling</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Detail study + numbers                                          */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: "1970s", label: "The era" },
  { value: "24 m²", label: "Floor area" },
  { value: "06", label: "Anchor objects" },
  { value: "01", label: "Room, one mood" },
];

function ParallaxCrop() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] overflow-hidden border border-room-ink/15 bg-room-ink"
    >
      <motion.img
        src={roomImg}
        alt="The desk and chair, seen from across the room"
        style={reduced ? undefined : { y, scale: 1.16 }}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-room-ink/60 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
        <Label className="text-room-bright">The desk corner</Label>
        <span className="text-[10px] uppercase tracking-[0.24em] text-room-cream/60">
          Facing east
        </span>
      </div>
    </div>
  );
}

function DetailStudy() {
  return (
    <section className="relative bg-room-cream px-[var(--page-x)] py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
        <Reveal>
          <ParallaxCrop />
        </Reveal>

        <div>
          <Reveal>
            <Label className="text-room-teal">04 — The Inventory</Label>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,4rem)] leading-[1.02] tracking-[-0.025em]">
              Everything here
              <br />
              <em className="text-room-teal">earns its place.</em>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-room-ink/60">
              Six objects, one rug, and a television that nobody turns on. The
              room is not styled — it is simply kept.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-9 border-t border-room-ink/15 pt-8">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={0.08 * index} y={18}>
                <p className="font-display text-[clamp(2rem,3.6vw,3.2rem)] leading-none tracking-[-0.02em]">
                  {stat.value}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-room-ink/45">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Closing                                                         */
/* ------------------------------------------------------------------ */

function Closing() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-9%", "5%"]);

  return (
    <section
      ref={ref}
      className="room-grain relative overflow-hidden bg-room-ink px-[var(--page-x)] pb-16 pt-28 text-room-cream sm:pb-20 sm:pt-40"
    >
      <motion.img
        src={roomImg}
        alt=""
        aria-hidden
        style={reduced ? undefined : { y, scale: 1.14 }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-room-ink/70 via-room-ink/60 to-room-ink" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal>
          <Label className="text-room-gold">05 — Outro</Label>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-6 font-display text-[clamp(3.2rem,11vw,9.5rem)] uppercase leading-[0.84] tracking-[-0.035em]">
            Stay
            <br />
            <em className="text-room-bright">a while.</em>
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col gap-8 border-t border-room-cream/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <Reveal delay={0.16}>
            <p className="max-w-xs text-sm leading-relaxed text-room-cream/65">
              The light will do the rest. The room is always open in the
              photograph.
            </p>
          </Reveal>

          <Reveal delay={0.22} className="sm:text-right">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-room-bright"
            >
              <span className="border-b border-room-bright/40 pb-1 transition-colors group-hover:border-room-bright">
                Return to the feed
              </span>
              <ArrowRight
                size={18}
                className="transition-transform duration-500 group-hover:translate-x-1.5"
              />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-room-cream/10 pt-6 text-[9px] uppercase tracking-[0.26em] text-room-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <span className="room-diamond">Photo study — Room N° 01</span>
          <span>Harvest / 2026</span>
          <span className="inline-flex items-center gap-2">
            Living room, after hours
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Photo() {
  return (
    <main className="photo-page relative bg-room-cream text-room-ink antialiased">
      <ScrollProgress />
      <Hero />
      <Manifesto />
      <Marquee />
      <Portal />
      <Gallery />
      <DetailStudy />
      <Closing />
    </main>
  );
}
