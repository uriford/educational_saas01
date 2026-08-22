"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { startAssessmentAction } from "../actions/start-assessment.action";
import { saveAssessmentAnswerAction } from "../actions/save-assessment-answer.action";
import { submitAssessmentAction } from "../actions/submit-assessment.action";

type Question = {
  id: string;
  question: string;
  type:
    | "MCQ"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "LONG_ANSWER";
  marks: number;
  options: unknown;
};

type Props = {
  assessmentId: string;
  title: string;
  duration: number | null;
  questions: Question[];
};

type AnswerMap = Record<string, string>;

function formatTime(seconds: number) {
  const safe = Math.max(seconds, 0);

  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(remaining).padStart(2, "0")}`;
}

function getOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

export default function AssessmentAttempt({
  assessmentId,
  title,
  duration,
  questions,
}: Props) {
  const [submissionId, setSubmissionId] =
    useState<string | null>(null);

  const [startedAt, setStartedAt] =
    useState<number | null>(null);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(null);


  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (x) => x.trim(),
      ).length,
    [answers],
  );


  const currentQuestion =
    questions[currentIndex];


  const startAttempt = useCallback(async () => {
    const result =
      await startAssessmentAction(
        assessmentId,
      );

    if (
      !result.success ||
      !("submission" in result) ||
      !result.submission
    ) {
      setMessage(
        result.message ??
          "Unable to start assessment.",
      );

      setLoading(false);
      return;
    }


    const submission =
      result.submission;


    setSubmissionId(
      submission.id,
    );


    const started =
      new Date(
        submission.startedAt,
      ).getTime();


    setStartedAt(started);


    const restored: AnswerMap = {};


    submission.answers.forEach(
      (answer) => {
        if (answer.answer) {
          restored[
            answer.questionId
          ] = answer.answer;
        }
      },
    );


    setAnswers(restored);


    if (duration) {
      setRemainingSeconds(
        Math.max(
          Math.ceil(
            (
              started +
              duration * 60000 -
              Date.now()
            ) / 1000,
          ),
          0,
        ),
      );
    }


    setLoading(false);
  }, [
    assessmentId,
    duration,
  ]);


  useEffect(() => {
    const initialize = async () => {
      await startAttempt();
    };

    void initialize();
  }, [startAttempt]);


  const saveAnswer = async (
    questionId:string,
    value:string,
  ) => {

    if (!submissionId) {
      return;
    }

    setAnswers((old)=>({
      ...old,
      [questionId]:value,
    }));

    setSaving(questionId);


    const result =
      await saveAssessmentAnswerAction({
        submissionId,
        questionId,
        answer:value,
      });




    setSaving(null);
  };


  const submit = async()=>{

    if(
      !submissionId ||
      submitting
    ){
      return;
    }


    const confirm =
      window.confirm(
        "Submit assessment now?",
      );


    if(!confirm){
      return;
    }


    setSubmitting(true);


    const result =
      await submitAssessmentAction(
        submissionId,
      );


    if(!result.success){


      setSubmitting(false);

      return;
    }


    setSubmitted(true);

    setSubmitting(false);
  };


  useEffect(()=>{

    if(
      !startedAt ||
      !duration ||
      submitted
    ){
      return;
    }


    const timer =
      setInterval(()=>{

        const remaining =
          Math.ceil(
            (
              startedAt +
              duration*60000 -
              Date.now()
            )/1000,
          );


        if(remaining<=0){
          clearInterval(timer);
          void submit();
          return;
        }


        setRemainingSeconds(
          remaining,
        );

      },1000);


    return()=>clearInterval(timer);

  },[
    startedAt,
    duration,
    submitted,
  ]);


  if(loading){

    return (
      <section className="rounded-2xl border bg-card p-10 text-center">
        <Loader2 className="mx-auto animate-spin"/>
        <p className="mt-4">
          Preparing assessment...
        </p>
      </section>
    );
  }


  if(submitted){

    return(
      <section className="rounded-2xl border bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500"/>
        <h2 className="mt-4 text-xl font-bold">
          Assessment Submitted
        </h2>

        <Link
          href={`/student/assessments/${assessmentId}/result?submission=${submissionId}`}
          className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 text-primary-foreground"
        >
          View Result
        </Link>
      </section>
    );
  }


  return(
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">


      <aside className="rounded-2xl border bg-card p-4">

        <h3 className="font-semibold">
          Questions
        </h3>


        <p className="mt-1 text-xs text-muted-foreground">
          {answeredCount}/{questions.length} completed
        </p>


        <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-3">

          {questions.map((q,index)=>(

            <button
              key={q.id}
              onClick={()=>setCurrentIndex(index)}
              className={`rounded-lg border p-2 text-sm ${
                index===currentIndex
                ?"bg-primary text-primary-foreground"
                :answers[q.id]
                ?"bg-emerald-100"
                :""
              }`}
            >
              {index+1}
            </button>

          ))}

        </div>

      </aside>



      <main className="space-y-5">


        <section className="rounded-2xl border bg-card p-5">

          <div className="flex justify-between">

            <div>
              <h2 className="font-bold">
                {title}
              </h2>

              <p className="text-sm text-muted-foreground">
                Question {currentIndex+1} of {questions.length}
              </p>

            </div>


            {duration && (
              <div className="rounded-xl bg-muted px-4 py-2 font-bold">
                <Clock3 className="inline size-4 mr-1"/>
                {formatTime(
                  remainingSeconds ?? 0
                )}
              </div>
            )}

          </div>

        </section>



        {currentQuestion && (

        <section className="rounded-2xl border bg-card p-6">


          <h2 className="font-semibold leading-7">
            {currentQuestion.question}
          </h2>


          <p className="mt-2 text-xs text-muted-foreground">
            {currentQuestion.marks} marks
          </p>



          <div className="mt-6">


          {currentQuestion.type==="MCQ" &&
          getOptions(
            currentQuestion.options
          ).map(option=>(

            <label
              key={option}
              className="flex gap-3 rounded-xl border p-4 mb-3 cursor-pointer"
            >

              <input
                type="radio"
                checked={
                  answers[currentQuestion.id]===option
                }
                onChange={()=>
                  void saveAnswer(
                    currentQuestion.id,
                    option
                  )
                }
              />

              {option}

            </label>

          ))}



          {(
            currentQuestion.type==="SHORT_ANSWER" ||
            currentQuestion.type==="LONG_ANSWER"
          ) && (

            <textarea
              rows={
                currentQuestion.type==="LONG_ANSWER"
                ?7
                :3
              }
              value={
                answers[currentQuestion.id] ?? ""
              }
              onChange={(e)=>
                setAnswers(old=>({
                  ...old,
                  [currentQuestion.id]:
                    e.target.value
                }))
              }
              onBlur={(e)=>
                void saveAnswer(
                  currentQuestion.id,
                  e.target.value
                )
              }
              className="w-full rounded-xl border p-4"
              placeholder="Write answer..."
            />

          )}


          </div>


        </section>

        )}



        <section className="flex justify-between">

          <button
            disabled={currentIndex===0}
            onClick={()=>
              setCurrentIndex(
                x=>x-1
              )
            }
            className="rounded-md border px-4 py-2"
          >
            <ChevronLeft className="inline"/>
            Previous
          </button>



          {currentIndex===questions.length-1 ? (

          <button
            onClick={submit}
            className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
          >
            <Send className="inline mr-2 size-4"/>
            Submit
          </button>

          ):(
          <button
            onClick={()=>
              setCurrentIndex(
                x=>x+1
              )
            }
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Next
            <ChevronRight className="inline"/>
          </button>
          )}

        </section>


      </main>

    </div>
  );
}
