import React, { useState, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Leaf,
  LogOut,
  Send,
  ImagePlus,
  Heart,
  MessageSquareText,
  PenLine,
  Trash2,
  Save,
  X,
  Trees,
  Loader2,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [imageFile, setImageFile] = useState(null); // حالة لتخزين ملف الصورة المختار
  const [commentInputs, setCommentInputs] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  // دالة لجلب المنشورات من قاعدة البيانات مع عدد الإعجابات والتعليقات
  async function fetchPosts() {
    const { data: { user }, } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    const { data, error } = await supabase
      .from("Post")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error.message);
      return;
    }

    const { data: likesData, error: likesError } = await supabase
      .from("Likes")
      .select("*");

    if (likesError) {
      console.error("Error fetching likes:", likesError.message);
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from("Comment")
      .select("*")
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError.message);
    }

    const likes = likesData || [];
    const comments = commentsData || [];

    setPosts(
      (data || []).map((post) => {
        const postLikes = likes.filter((like) => like.post_id === post.id);
        const postComments = comments.filter((comment) => comment.post_id === post.id);
        return {
          ...post,
          likesCount: postLikes.length,
          likedByMe: user
            ? postLikes.some((like) => like.user_id === user.id)
            : false,
          comments: postComments,
        };
      })
    );
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  // دالة مساعدة لرفع الصورة إلى Supabase Storage والحصول على الرابط
  async function uploadImage(file) {
    // توليد اسم فريد للملف باستخدام الوقت الحالي لمنع تكرار الأسماء
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // رفع الملف إلى الباكت المسمى post-images
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // جلب الرابط العام (Public URL) الخاص بالصورة المرفوعة
    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // دالة إنشاء المنشور المحدثة
  async function handleCreatePost(e) {
    e.preventDefault();
    setError("");

    if (!newPostContent.trim() && !imageFile) return;

    setIsLoading(true);
    try {
      // 1. جلب بيانات المستخدم المسجل حالياً لربط الـ user_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to create a post.");
        setIsLoading(false);
        return;
      }

      let uploadedImageUrl = null;

      // 2. إذا اختار المستخدم صورة، قم برفعها أولاً
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      // 3. إرسال البيانات للجدول (Post) بما فيها رابط الصورة والمعرف الفريد
      const { error } = await supabase.from("Post").insert([
        {
          title: newPostTitle.trim() || null,
          content: newPostContent.trim(),
          user_id: user.id, // تم التخلص من الـ NULL هنا
          image_url: uploadedImageUrl, // حفظ رابط الصورة الحقيقي
        },
      ]);

      if (error) {
        console.error("Error creating post:", error.message);
        setError(error.message);
      } else {
        setNewPostTitle("");
        setNewPostContent("");
        setImageFile(null); // إعادة تصفية حقل الصورة بعد النجاح
        // تفريغ حقل الإدخال اليدوي الخاص بالملف في الواجهة
        document.getElementById("imageInput").value = "";
        fetchPosts();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Failed to upload image or save post.");
    } finally {
      setIsLoading(false);
    }
  }

  // تسجيل الخروج
  /* async function handleLogout() {
     await supabase.auth.signOut(); 
     localStorage.removeItem("usertoken"); 
     navigate("/Login");
   }*/

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    navigate('/Login', { replace: true });
  }

  async function handledeletepost(postid) {
    setError("");

    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeletingPostId(postid);

    try {
      // احذف الإعجابات والتعليقات أولاً بسبب المفاتيح الأجنبية
      const { error: likesError } = await supabase
        .from("Likes")
        .delete()
        .eq("post_id", postid);

      if (likesError) {
        setError(likesError.message);
        return;
      }

      const { error: commentsError } = await supabase
        .from("Comment")
        .delete()
        .eq("post_id", postid);

      if (commentsError) {
        setError(commentsError.message);
        return;
      }

      const { error } = await supabase.from("Post").delete().eq("id", postid);

      if (error) {
        console.log("error deleting post", error.message);
        setError(error.message);
        return;
      }

      fetchPosts();
    } finally {
      setDeletingPostId(null);
    }
  }

  async function handledeleteallposts() {
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to delete posts.");
      return;
    }

    const myPosts = posts.filter((post) => post.user_id === user.id);

    if (myPosts.length === 0) {
      setError("You have no posts to delete.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete all your posts (${myPosts.length})? This cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingAll(true);

    try {
      const postIds = myPosts.map((post) => post.id);

      const { error: likesError } = await supabase
        .from("Likes")
        .delete()
        .in("post_id", postIds);

      if (likesError) {
        setError(likesError.message);
        return;
      }

      const { error: commentsError } = await supabase
        .from("Comment")
        .delete()
        .in("post_id", postIds);

      if (commentsError) {
        setError(commentsError.message);
        return;
      }

      const { error } = await supabase
        .from("Post")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.log("error deleting all posts", error.message);
        setError(error.message);
        return;
      }

      fetchPosts();
    } finally {
      setIsDeletingAll(false);
    }
  }

  async function handlelikepost(postid, likedByMe) {
    setError("");

    const { data: { user }, error: userError, } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to like a post.");
      return;
    }

    if (likedByMe) {
      const { error } = await supabase
        .from("Likes")
        .delete()
        .eq("post_id", postid)
        .eq("user_id", user.id);

      if (error) {
        console.log("error unliking post", error.message);
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("Likes").insert([
        {
          post_id: postid,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.log("error liking post", error.message);
        setError(error.message);
        return;
      }
    }

    fetchPosts();

    alert("post liked successfully")
  }

  async function handlecommentpost(postid) {
    setError("");

    const text = (commentInputs[postid] || "").trim();
    if (!text) {
      setError("Please write a comment first.");
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to comment on a post.");
      return;
    }

    const { error } = await supabase.from("Comment").insert([
      {
        post_id: postid,
        user_id: user.id,
        comment_text: text,
      },
    ]);

    if (error) {
      console.log("error commenting on post", error.message);
      setError(error.message);
      return;
    }

    setCommentInputs((prev) => ({ ...prev, [postid]: "" }));
    fetchPosts();
  }

  async function handledeletecomment(commentid) {
    setError("");

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const { error } = await supabase
      .from("Comment")
      .delete()
      .eq("id", commentid);

    if (error) {
      console.log("error deleting comment", error.message);
      setError(error.message);
      return;
    }

    fetchPosts();
  }

  function startEditPost(post) {
    setError("");
    setEditingPostId(post.id);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setEditImageFile(null);
  }

  function cancelEditPost() {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
    setEditImageFile(null);
  }

  async function handleupdatepost(postid) {
    setError("");

    if (!editContent.trim() && !editImageFile) {
      setError("Post content cannot be empty.");
      return;
    }

    setIsUpdating(true);

    try {

      const {data: { user },error: userError,} = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to update a post.");
        return;
      }

      const updates = {title: editTitle.trim() || null,content: editContent.trim(),};

      if (editImageFile) {
        updates.image_url = await uploadImage(editImageFile);
      }

      const { error } = await supabase
        .from("Post")
        .update(updates)
        .eq("id", postid)
        .eq("user_id", user.id);

      if (error) {
        console.log("error updating post", error.message);
        setError(error.message);
        return;
      }

      cancelEditPost();
      fetchPosts();
    } catch (err) {
      console.error("Unexpected error updating post:", err);
      setError("Failed to update post.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="min-h-screen wood-grain bg-wood-50 relative">
      {/* Falling leaves background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Leaf
            key={i}
            size={22 + (i % 3) * 8}
            className="absolute text-wood-300/40 animate-leaf-sway"
            style={{
              left: `${10 + i * 15}%`,
              top: `${5 + (i % 4) * 22}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen p-6 flex flex-col items-center">
        {/* الهيدر العلوي */}
        <div className="w-full max-w-xl flex justify-between items-center mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-wood-700 text-wood-50 shadow-wood">
              <Trees size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-wood-800 leading-tight">
                Home Feed
              </h1>
              <p className="text-xs text-wood-500">Stories from the orchard</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {currentUserId && posts.some((post) => post.user_id === currentUserId) && (
              <Button
                onPress={handledeleteallposts}
                isDisabled={isDeletingAll}
                className="rounded-xl border border-leaf-600/30 bg-leaf-50 px-4 text-sm font-medium text-leaf-700 hover:bg-leaf-100"
              >
                {isDeletingAll ? (
                  <Loader2 size={15} className="mr-1.5 animate-spin" />
                ) : (
                  <Trash2 size={15} className="mr-1.5" />
                )}
                {isDeletingAll ? "Deleting..." : "Delete All My Posts"}
              </Button>
            )}
            <Button
              onPress={handleLogout}
              className="rounded-xl border border-wood-300 bg-wood-50/80 px-4 text-sm font-medium text-wood-700 shadow-inset transition hover:bg-wood-100"
            >
              <LogOut size={15} className="mr-1.5" />
              Logout
            </Button>
          </div>
        </div>

        {/* صندوق إضافة بوست جديد المحدث بحقل الصورة */}
        <form
          onSubmit={handleCreatePost}
          className="wood-panel w-full max-w-xl p-4 rounded-2xl shadow-wood mb-6 flex flex-col gap-3 animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="mb-1 flex items-center gap-2">
            <Leaf size={16} className="text-leaf-600" />
            <span className="font-display text-lg text-wood-800">
              Share something
            </span>
          </div>
          <Input
            type="text"
            placeholder="Title (optional)"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            variant="bordered"
            radius="lg"
            classNames={{
              input: "text-wood-800 placeholder:text-wood-400",
              inputWrapper:
                "bg-wood-50/70 border-wood-300 data-[hover=true]:border-wood-400 data-[focus=true]:border-wood-600",
            }}
            className="w-full"
          />
          <Input
            type="text"
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            variant="bordered"
            radius="lg"
            classNames={{
              input: "text-wood-800 placeholder:text-wood-400",
              inputWrapper:
                "bg-wood-50/70 border-wood-300 data-[hover=true]:border-wood-400 data-[focus=true]:border-wood-600",
            }}
            className="w-full"
          />

          {/* حقل اختيار ملف الصورة الجديد */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-wood-500 font-medium">Add an image to your post:</label>
            <label
              htmlFor="imageInput"
              className="group flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-wood-300 bg-wood-50/60 px-3 py-2.5 text-sm text-wood-500 transition hover:border-wood-400 hover:bg-wood-100"
            >
              <ImagePlus size={16} className="text-wood-500 group-hover:text-wood-700" />
              <span className="truncate">
                {imageFile ? imageFile.name : "Choose an image…"}
              </span>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="text-leaf-600 text-sm">{error}</p>}
          <Button
            type="submit"
            className="btn-wood self-end px-6"
            isDisabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={15} className="mr-1.5 animate-spin" />
            ) : (
              <Send size={15} className="mr-1.5" />
            )}
            {isLoading ? "Posting..." : "Post"}
          </Button>
        </form>

        {/* عرض قائمة المنشورات المعدلة لعرض الصور */}
        <div className="w-full max-w-xl flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-wood-200 bg-wood-50/60 p-10 text-center shadow-wood animate-fade-up">
              <Leaf size={28} className="mx-auto mb-3 text-wood-300" />
              <p className="text-center text-wood-500 py-4">
                No posts available yet. Be the first to post!
              </p>
            </div>
          ) : (
            posts.map((post, i) => (
              <div
                key={post.id}
                className="bg-wood-50/80 p-5 rounded-2xl shadow-wood border border-wood-200/70 flex flex-col gap-2 animate-fade-up backdrop-blur-sm"
                style={{ animationDelay: `${0.05 * i + 0.1}s` }}
              >
                {editingPostId === post.id ? (
                  <div className="flex flex-col gap-3">
                    <Input
                      type="text"
                      placeholder="Title (optional)"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      variant="bordered"
                      radius="lg"
                      classNames={{
                        input: "text-wood-800",
                        inputWrapper: "bg-wood-50/70 border-wood-300",
                      }}
                      className="w-full"
                    />
                    <Input
                      type="text"
                      placeholder="What's on your mind?"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      variant="bordered"
                      radius="lg"
                      classNames={{
                        input: "text-wood-800",
                        inputWrapper: "bg-wood-50/70 border-wood-300",
                      }}
                      className="w-full"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-wood-500">
                        Change image (optional):
                      </label>
                      <label className="group flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-wood-300 bg-wood-50/60 px-3 py-2.5 text-sm text-wood-500 transition hover:border-wood-400">
                        <ImagePlus size={16} className="text-wood-500" />
                        <span className="truncate">
                          {editImageFile ? editImageFile.name : "Choose a new image…"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditImageFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onPress={() => handleupdatepost(post.id)}
                        isDisabled={isUpdating}
                        className="rounded-xl bg-wood-700 px-4 text-sm font-medium text-wood-50 hover:bg-wood-800"
                      >
                        <Save size={15} className="mr-1.5" />
                        {isUpdating ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onPress={cancelEditPost}
                        isDisabled={isUpdating}
                        className="rounded-xl border border-wood-300 bg-wood-50 px-4 text-sm font-medium text-wood-700 hover:bg-wood-100"
                      >
                        <X size={15} className="mr-1.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {post.title && (
                      <h2 className="font-display font-bold text-wood-800 text-base">
                        {post.title}
                      </h2>
                    )}

                    <p className="text-wood-700 text-sm leading-relaxed">{post.content}</p>

                    {post.image_url && (
                      <div className="mt-2 max-h-64 overflow-hidden rounded-xl border border-wood-200 shadow-wood">
                        <img
                          src={post.image_url}
                          alt="Post attached visual"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </>
                )}

                <p className="mt-1 text-xs text-wood-400">
                  {new Date(post.created_at).toLocaleString()}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    onPress={() => handlelikepost(post.id, post.likedByMe)}
                    className={
                      post.likedByMe
                        ? "rounded-xl bg-leaf-600 px-4 text-sm font-medium text-wood-50 hover:bg-leaf-700"
                        : "rounded-xl border border-wood-300 bg-wood-50 px-4 text-sm font-medium text-wood-700 hover:bg-wood-100"
                    }
                  >
                    <Heart
                      size={15}
                      className="mr-1.5"
                      fill={post.likedByMe ? "currentColor" : "none"}
                    />
                    {post.likedByMe ? "Unlike" : "Like"} ({post.likesCount || 0})
                  </Button>

                  {currentUserId === post.user_id && editingPostId !== post.id && (
                    <>
                      <Button
                        onPress={() => startEditPost(post)}
                        className="rounded-xl border border-wood-300 bg-wood-50 px-4 text-sm font-medium text-wood-700 hover:bg-wood-100"
                      >
                        <PenLine size={15} className="mr-1.5" />
                        Edit Post
                      </Button>
                      <Button
                        onPress={() => handledeletepost(post.id)}
                        isDisabled={deletingPostId === post.id}
                        className="rounded-xl border border-leaf-600/30 bg-leaf-50 px-4 text-sm font-medium text-leaf-700 hover:bg-leaf-100"
                      >
                        <Trash2 size={15} className="mr-1.5" />
                        {deletingPostId === post.id ? "Deleting..." : "Delete Post"}
                      </Button>
                    </>
                  )}
                </div>

                {post.comments?.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 border-t border-wood-200 pt-3">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start justify-between gap-2 rounded-lg bg-wood-100/70 px-3 py-2"
                      >
                        <p className="text-sm text-wood-700">
                          <MessageSquareText
                            size={13}
                            className="mr-1 inline text-wood-400"
                          />
                          {comment.comment_text}
                          <span className="ml-2 text-xs text-wood-400">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </p>

                        {currentUserId === comment.user_id && (
                          <Button
                            onPress={() => handledeletecomment(comment.id)}
                            className="min-w-0 shrink-0 rounded-md bg-transparent px-2 py-1 text-xs font-medium text-leaf-700 hover:bg-leaf-100"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 rounded-xl border border-wood-300 bg-wood-50/80 px-3 py-2 text-sm text-wood-800 placeholder:text-wood-400 focus:border-wood-600 focus:outline-none"
                  />
                  <Button
                    onPress={() => handlecommentpost(post.id)}
                    className="shrink-0 rounded-xl bg-wood-700 px-4 text-sm font-medium text-wood-50 hover:bg-wood-800"
                  >
                    <MessageSquareText size={15} className="mr-1.5" />
                    Comment
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-wood-400">
          <Leaf size={13} className="mb-1 inline animate-leaf-sway" /> Harvest Feed · autumn edition
        </footer>
      </div>
    </div>
  );
}
