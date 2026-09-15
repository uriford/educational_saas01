"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";

import { createReviewAction } from "@/features/reviews/actions/create-review.action";

type Props = {
  authorType: "STUDENT" | "GUARDIAN";
};

export default function ReviewForm({ authorType }: Props) {
  const [type, setType] = useState<"TEXT" | "VIDEO">("TEXT");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const result = await createReviewAction({
      type,
      rating,
      content,
      video,
    });

    setMessage(result.message);

    if (result.success) {
      setContent("");
      setVideo(null);
      setRating(5);

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }

    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div>
        <p className="text-sm font-semibold text-slate-500">
          Your review will appear as
        </p>

        <p className="mt-1 font-bold text-slate-950">
          {authorType === "STUDENT"
            ? "Verified Student"
            : "Guardian Testimonial"}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-700">
          Review type
        </p>

        <div className="mt-2 flex gap-2">
          {(["TEXT", "VIDEO"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setType(option);
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                type === option
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {option === "TEXT"
                ? "Text review"
                : "Video review"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-700">
          Rating
        </p>

        <div className="mt-2 flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= rating
                      ? "fill-current text-slate-950"
                      : "text-slate-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {type === "TEXT" ? (
        <div className="mt-6">
          <label
            htmlFor="review-content"
            className="text-sm font-semibold text-slate-700"
          >
            Your review
          </label>

          <textarea
            id="review-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            placeholder="Share your experience..."
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700">
            Your video
          </p>

          <input
            ref={videoInputRef}
            id="review-video"
            type="file"
            accept="video/*"
            onChange={(event) => {
              setVideo(event.target.files?.[0] ?? null);
              setMessage("");
            }}
            className="sr-only"
          />

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Choose video
          </button>

          {video ? (
            <p className="mt-2 text-sm text-slate-600">
              Selected:{" "}
              <span className="font-semibold">
                {video.name}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Choose a video from your device. Maximum size: 50 MB.
            </p>
          )}
        </div>
      )}

      {message ? (
        <p className="mt-4 text-sm font-medium text-slate-600">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
