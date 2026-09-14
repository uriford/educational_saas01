import Link from "next/link";

import ReviewForm from "./ReviewForm";
import AdminReviewList from "./AdminReviewList";
import { ArrowLeft, PlayCircle, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Review = {
  id: string;
  authorType: "STUDENT" | "GUARDIAN";
  type: "TEXT" | "VIDEO";
  rating: number;
  content: string | null;
  videoUrl: string | null;
  approved: boolean;
  createdAt: Date;
  user: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
};

type Props = {
  organizationName: string;
  reviews: Review[];
  canSubmit: boolean;
  authorType: "STUDENT" | "GUARDIAN" | null;
  isAdmin: boolean;
};

export default function PublicReviews({
  organizationName,
  reviews,
  canSubmit,
  authorType,
  isAdmin,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Reviews
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            What people say about {organizationName}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Read experiences shared by our students and guardians.
          </p>
        </div>

        {canSubmit ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Share your experience
            </h2>

            <p className="mt-2 text-slate-600">
              You are eligible to submit a{" "}
              {authorType === "STUDENT"
                ? "Verified Student"
                : "Guardian Testimonial"}
              .
            </p>

            {authorType ? (
              <ReviewForm authorType={authorType} />
            ) : null}
          </div>
        ) : null}

        {isAdmin ? (
          <div className="mt-12">
            <AdminReviewList reviews={reviews} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              No reviews yet
            </h2>
            <p className="mt-2 text-slate-600">
              Reviews from our community will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      {review.user.avatar ? (
                        <AvatarImage
                          src={review.user.avatar}
                          alt={`${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim()}
                        />
                      ) : null}
                      <AvatarFallback>
                        {`${review.user.firstName?.[0] ?? ""}${review.user.lastName?.[0] ?? ""}`.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold text-slate-950">
                        {`${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim() || "Anonymous"}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">
                        {review.authorType === "STUDENT"
                          ? "Verified Student"
                          : "Guardian Testimonial"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-current text-slate-950"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.type === "VIDEO" && review.videoUrl ? (
                  <a
                    href={review.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 p-4 font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <PlayCircle className="h-6 w-6" />
                    Watch video review
                  </a>
                ) : (
                  <p className="mt-6 text-base leading-7 text-slate-700">
                    {review.content}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
