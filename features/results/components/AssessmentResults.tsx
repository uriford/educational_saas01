"use client";

import {
  Award,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

type Props = {
  result: {
    title: string;
    course: {
      id: string;
      name: string;
      code: string;
    };
    status: string;
    totalMarks: number;
    passingMarks: number;
    score: number;
    percentage: number;
    passed: boolean;
    pendingManualGrading: boolean;
    questionCount: number;
    answeredCount: number;
    attemptNumber: number;
    submittedAt: Date | string | null;
  };
};

function formatDate(value: Date | string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPerformanceLabel(
  percentage: number,
) {
  if (percentage >= 90)
    return "Outstanding Performance";

  if (percentage >= 75)
    return "Excellent Performance";

  if (percentage >= 60)
    return "Good Performance";

  if (percentage >= 40)
    return "Needs Improvement";

  return "Keep Practicing";
}

export default function AssessmentResults({
  result,
}: Props) {

  const statusLabel =
    result.pendingManualGrading
      ? "Pending Review"
      : result.passed
        ? "Passed"
        : "Failed";


  return (
    <div className="space-y-6">


      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">

        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">


          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">


            <div>

              <div className="flex items-center gap-3">

                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Trophy className="size-6 text-primary"/>
                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Assessment Result
                  </p>

                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {result.title}
                  </h1>

                </div>

              </div>


              <p className="mt-5 font-medium">
                {result.course.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {result.course.code}
              </p>


              <p className="mt-5 text-lg font-semibold">
                {getPerformanceLabel(
                  result.percentage,
                )}
              </p>


            </div>



            <div className="flex flex-col items-center gap-4">


              <div className="relative flex size-40 items-center justify-center rounded-full border-[12px] border-muted">

                <div className="absolute inset-[-12px] rounded-full border-[12px] border-primary border-r-transparent border-b-transparent -rotate-45"/>


                <div className="text-center">

                  <p className="text-4xl font-bold">
                    {result.percentage.toFixed(0)}%
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Score
                  </p>

                </div>

              </div>



              <div
                className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold ${
                  result.pendingManualGrading
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950"
                  : result.passed
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950"
                  : "bg-destructive/10 text-destructive"
                }`}
              >

                {
                  result.pendingManualGrading ? (
                    <Clock3 className="size-5"/>
                  )
                  :
                  result.passed ? (
                    <CheckCircle2 className="size-5"/>
                  )
                  :
                  (
                    <XCircle className="size-5"/>
                  )
                }

                {statusLabel}

              </div>


            </div>


          </div>


        </div>

      </section>



      {
        result.pendingManualGrading && (

          <section className="rounded-2xl border border-amber-300/50 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">

            <div className="flex gap-3">

              <Clock3 className="size-5 text-amber-600"/>

              <div>

                <p className="font-semibold">
                  Manual grading in progress
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Written answers are waiting for teacher review.
                </p>

              </div>

            </div>

          </section>

        )
      }



      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


        <Metric
          icon={<Award className="size-4"/>}
          label="Score"
          value={`${result.score}/${result.totalMarks}`}
        />


        <Metric
          icon={<Target className="size-4"/>}
          label="Accuracy"
          value={`${result.percentage.toFixed(2)}%`}
        />


        <Metric
          icon={<FileCheck2 className="size-4"/>}
          label="Passing Marks"
          value={String(result.passingMarks)}
        />


        <Metric
          icon={<Trophy className="size-4"/>}
          label="Attempt"
          value={`#${result.attemptNumber}`}
        />


      </section>




      <section className="rounded-2xl border bg-card p-6 shadow-sm">

        <h2 className="font-semibold">
          Performance Summary
        </h2>


        <div className="mt-5 grid gap-5 sm:grid-cols-3">


          <Info
            label="Questions Answered"
            value={`${result.answeredCount}/${result.questionCount}`}
          />


          <Info
            label="Submission Status"
            value={result.status}
          />


          <Info
            label="Submitted"
            value={formatDate(result.submittedAt)}
          />


        </div>


      </section>




      <section className="rounded-2xl border bg-card p-6 shadow-sm">

        <h2 className="font-semibold">
          AI Learning Insight
        </h2>


        <p className="mt-2 text-sm text-muted-foreground">
          Personalized recommendations will appear here after AI analysis.
        </p>


      </section>


    </div>
  );
}



function Metric({
  icon,
  label,
  value,
}:{
  icon:React.ReactNode;
  label:string;
  value:string;
}){

return (

<div className="rounded-2xl border bg-card p-5 shadow-sm">

<div className="flex items-center gap-2 text-sm text-muted-foreground">
{icon}
{label}
</div>

<p className="mt-3 text-2xl font-bold">
{value}
</p>

</div>

);

}



function Info({
 label,
 value,
}:{
 label:string;
 value:string;
}){

return (

<div>

<p className="text-xs text-muted-foreground">
{label}
</p>

<p className="mt-1 font-semibold">
{value}
</p>

</div>

);

}
