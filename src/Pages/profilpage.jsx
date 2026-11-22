import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import serumVideo from "../assets/serum_part1_hq_0001-0062_eaf2140e.mp4";

// Simple class merger (no external utils needed)
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SLICES = 16;
const CAMERA = 1.6;
const MAX_WIDTH = 55;

function arc(bend) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

function measure(width, height, tile, aspect, gap, bend) {
  const h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect);
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
}

function TiltedGridHero({
  images = [],
  speed = 4,
  tileHeight = 35,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 50,
  curve = 70,
  fade = 15,
  children,
  className,
}) {
  const ref = React.useRef(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  const [layout, setLayout] = React.useState(null);
  const [shown, setShown] = React.useState({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns && prev.sweep === next.sweep && prev.unit === next.unit
          ? prev
          : next
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  React.useEffect(() => {
    for (const img of images) {
      if (img?.src) new Image().src = img.src;
    }
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 400, tileHeight, aspectRatio, gap, bend);

  const u = (n) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(MAX_WIDTH / aspectRatio).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  const turn = (deg) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ containerType: "size" }}
    >
      <style>{css}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];
          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden bg-neutral-800",
                    k === 0 && "rounded-l-lg",
                    k === SLICES - 1 && "rounded-r-lg"
                  )}
                  style={{
                    left: u((aspectRatio - share) / 2),
                    width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                  }}
                >
                  {img?.src ? (
                    <img
                      src={img.src}
                      alt=""
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: u(-k * share),
                        width: u(aspectRatio),
                        height: u(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}

export default function Profilpage() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: posts } = await supabase
            .from("Post")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          setUserPosts(posts || []);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Demo gallery images for the curved banner
  const galleryImages = [
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop" },
    { src: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop" },
    { src: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop" },
    { src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop" },
    { src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-12">
      {/* 3D Tilted Grid Animated Banner */}
      <TiltedGridHero
        images={galleryImages}
        className="w-full h-72 sm:h-80 bg-neutral-900 border-b border-neutral-800"
      />

      {/* Profile Details Container */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-bold shadow-md">
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
              </h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {userPosts.length}
              </span>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
          </div>
        </div>

        {/* User's Posts Section */}
        <div className="mt-8 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Posts</h2>

          {loading ? (
            <p className="text-gray-500 text-center py-6">Loading profile...</p>
          ) : userPosts.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl text-center text-gray-500 border border-gray-100 dark:border-neutral-800">
              You haven't posted anything yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col gap-2"
              >
                {post.title && (
                  <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.content}
                </p>
                {post.image_url && (
                  <div className="rounded-xl overflow-hidden max-h-64 mt-2">
                    <img src={post.image_url} alt="Post visual" className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}