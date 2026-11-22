import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import HoloCard from "../Component/HoloCard";
import { Button } from "@heroui/react";

export default function Postdetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get postId from route params (:id) or query string (?id=...)
  const postId = id || searchParams.get("id");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preset, setPreset] = useState("bursts");

  async function fetchPostDetails(postid) {
    if (!postid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("Post")
        .select("*")
        .eq("id", postid)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPost(data);
      }
    } catch (error) {
      
      setError("An error occurred while fetching the post details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
    } else {
      // If no ID is passed, fetch the latest post as fallback preview
      async function fetchLatestPost() {
        setLoading(true);
        const { data } = await supabase
          .from("Post")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (data) setPost(data);
        setLoading(false);
      }
      fetchLatestPost();
    }
  }, [postId]);

  // Fallback placeholder card image if post has no image
  const cardImage =
    post?.image_url ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10 px-4 flex flex-col items-center">
      {/* Back button */}
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <Button
          onPress={() => navigate(-1)}
          className="bg-neutral-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          ← Back
        </Button>
        <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
          Holographic Card View
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-72">
          <p className="text-gray-500 animate-pulse">Loading post details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-600 p-4 rounded-xl border border-red-200 dark:border-red-800 max-w-md text-center">
          {error}
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-10 bg-white dark:bg-neutral-900 p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-800">
          {/* Holographic 3D Card Display */}
          <div className="flex flex-col items-center gap-4">
            <HoloCard
              image={cardImage}
              alt={post?.title || "Post holographic card"}
              preset={preset}
              foilColor="#e2e6ec"
              intensity={0.85}
              scale={1}
              edgeSparkle={0.8}
              frame={4}
              glare={0.5}
              tiltMax={14}
              hoverScale={1.04}
              radius={14}
              width={320}
              idle
              shadow
            />

            {/* Foil Preset Selector */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-[320px] mt-2">
              {["bursts", "stars", "shards", "cosmos", "rainbow", "swirl", "glitter", "gold"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    preset === p
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Post Content Details */}
          <div className="flex-1 flex flex-col gap-4 max-w-md text-left">
            <div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                Post #{post?.id || "—"}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {post?.title || "Untitled Post"}
              </h1>
              {post?.created_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Published on {new Date(post.created_at).toLocaleDateString()} at{" "}
                  {new Date(post.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>

            <hr className="border-gray-200 dark:border-neutral-800" />

            <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-neutral-950/50 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800/80">
              {post?.content || "No text description provided for this post."}
            </div>

            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>💡 Move your mouse or tilt your device over the card to see the 3D foil shine.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
