"use client";

import { toast } from "sonner";

import type { AIQuestionType } from "../types/ai-question.types";

import { useState } from "react";
import {
  Check,
  Loader2,
  X,
  Upload,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  approveAIGeneratedQuestionAction,
  rejectAIGeneratedQuestionAction,
  updateAIGeneratedQuestionAction,
  importAIGeneratedQuestionAction,
approveManyAIGeneratedQuestionsAction,
rejectManyAIGeneratedQuestionsAction,
} from "../actions/ai-question-generation.actions";


type Question = {
  id: string;
  question: string;
  type: AIQuestionType;
  marks: number;
  options?: string[] | null;
  correctAnswer?: string | null;
  status: string;
  order: number;
};


type Props = {
  courseId: string;
  assessmentId: string;
  generation: {
    id: string;
    title: string | null;
    description: string | null;
    status: string;
    questionCount: number;
    difficulty: string | null;
    createdAt: Date;

    sourceDocuments: {
      id: string;
      name: string;
      fileName: string;
      pageCount: number | null;
    }[];

    questions: Question[];
  };
};


export default function AIQuestionReview({
  assessmentId,
  generation,
}: Props) {

  const [questions,setQuestions] =
    useState(generation.questions);

  const [editing,setEditing] =
    useState<string | null>(null);

  const [loading,setLoading] =
    useState<string | null>(null);

  const [selected,setSelected] =
    useState<string[]>([]);

  const [rejectDialogOpen,setRejectDialogOpen] =
    useState(false);

  const [approveDialogOpen,setApproveDialogOpen] =
    useState(false);

  const [approveTarget,setApproveTarget] =
    useState<string | null>(null);

  const [rejectTarget,setRejectTarget] =
    useState<string | null>(null);

  const [reviewNote,setReviewNote] =
    useState("");


  function toggleSelectAllPending(){

    const pendingIds = questions
      .filter(q => q.status === "PENDING_REVIEW")
      .map(q => q.id);

    const allSelected =
      pendingIds.every(id =>
        selected.includes(id)
      );

    if(allSelected){

      setSelected(current =>
        current.filter(id =>
          !pendingIds.includes(id)
        )
      );

    } else {

      setSelected(current =>
        Array.from(
          new Set([
            ...current,
            ...pendingIds
          ])
        )
      );

    }

  }



  async function approve(id:string){

    setLoading(id);

    const result =
      await approveAIGeneratedQuestionAction({
        id,
      });

    if(result.success){

      setQuestions(current =>
        current.map(q =>
          q.id === id
          ? {...q,status:"APPROVED"}
          : q
        )
      );

    }

    setLoading(null);
  }


  async function reject(id:string){

    setLoading(id);

    const result =
      await rejectAIGeneratedQuestionAction({
        id,
      });

    if(result.success){

      setQuestions(current =>
        current.map(q =>
          q.id === id
          ? {...q,status:"REJECTED"}
          : q
        )
      );

    }

    setLoading(null);
  }


  
function toggleSelect(id:string){

  setSelected(current =>
    current.includes(id)
      ? current.filter(item => item !== id)
      : [...current,id]
  );

}


async function bulkApprove(){

  if(!selected.length) return;

  const result =
    await approveManyAIGeneratedQuestionsAction({
      ids:selected,
    });

  if(result.success){

    setQuestions(current =>
      current.map(q =>
        selected.includes(q.id)
          ? {...q,status:"APPROVED"}
          : q
      )
    );

    setSelected([]);

  }

}


async function bulkReject(){

  if(!selected.length) return;

  const result =
    await rejectManyAIGeneratedQuestionsAction({
      ids:selected,
    });

  if(result.success){

    setQuestions(current =>
      current.map(q =>
        selected.includes(q.id)
          ? {...q,status:"REJECTED"}
          : q
      )
    );

    setSelected([]);

  }

}


async function importQuestion(id:string){

    setLoading(id);

    await importAIGeneratedQuestionAction({
      generatedQuestionId:id,
      assessmentId,
    });

    setLoading(null);
  }


  async function saveEdit(question:Question){

    setLoading(question.id);

    const result =
      await updateAIGeneratedQuestionAction({
        id: question.id,
        question: question.question,
        type: question.type,
        marks: question.marks,
        options: question.options ?? undefined,
        correctAnswer: question.correctAnswer,
      });


    if(result.success){

      setEditing(null);

    }

    setLoading(null);
  }


  const reviewStats = {
    total: questions.length,
    pending: questions.filter(
      q => q.status === "PENDING_REVIEW"
    ).length,
    approved: questions.filter(
      q => q.status === "APPROVED"
    ).length,
    rejected: questions.filter(
      q => q.status === "REJECTED"
    ).length,
  };


  return (
    <> 
    <div className="space-y-6">

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div>
            <p className="text-sm text-muted-foreground">
              Total
            </p>
            <p className="text-2xl font-bold">
              {reviewStats.total}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Pending
            </p>
            <p className="text-2xl font-bold">
              {reviewStats.pending}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Approved
            </p>
            <p className="text-2xl font-bold">
              {reviewStats.approved}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Rejected
            </p>
            <p className="text-2xl font-bold">
              {reviewStats.rejected}
            </p>
          </div>

        </div>
      </Card>


      <Card className="p-6">

        <h2 className="text-xl font-semibold">
          {generation.title}
        </h2>


        <p className="mt-2 text-sm text-muted-foreground">
          {generation.description}
        </p>


        <div className="mt-4 flex flex-wrap gap-2">

          <Badge>
            {generation.questionCount} Questions
          </Badge>

          <Badge variant="secondary">
            {generation.difficulty}
          </Badge>

          <Badge variant="outline">
            {generation.status}
          </Badge>

        </div>

      </Card>



      <Card className="p-6">

        <h3 className="font-semibold">
          Source Documents
        </h3>


        <div className="mt-4 space-y-2">

        {generation.sourceDocuments.map(doc=>(

          <div
            key={doc.id}
            className="rounded-lg border p-3 text-sm"
          >

            <p className="font-medium">
              {doc.name}
            </p>

            <p className="text-muted-foreground">
              {doc.fileName}
              {" "}
              {doc.pageCount &&
                `(${doc.pageCount} pages)`
              }
            </p>

          </div>

        ))}

        </div>

      </Card>




      <Card className="p-4">

        <Button
          variant="outline"
          onClick={toggleSelectAllPending}
        >
          Select All Pending
        </Button>


        <div className="flex flex-wrap gap-3 mt-3">

          <Button
            disabled={!selected.length}
            onClick={async () => {

              await approveManyAIGeneratedQuestionsAction({
                ids:selected,
              });

              setQuestions(current =>
                current.map(q =>
                  selected.includes(q.id)
                    ? {
                        ...q,
                        status:"APPROVED",
                      }
                    : q
                )
              );

              setSelected([]);

              toast.success(
                "Selected questions approved successfully."
              );

            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Approve Selected ({selected.length})
          </Button>


          <Button
            variant="destructive"
            disabled={!selected.length}
            onClick={async () => {

              await rejectManyAIGeneratedQuestionsAction({
                ids:selected,
              });

              setQuestions(current =>
                current.map(q =>
                  selected.includes(q.id)
                    ? {
                        ...q,
                        status:"REJECTED",
                      }
                    : q
                )
              );

              setSelected([]);

              toast.success(
                "Selected questions rejected successfully."
              );

            }}
          >
            <X className="mr-2 h-4 w-4" />
            Reject Selected ({selected.length})
          </Button>

        </div>
      </Card>


      <div className="space-y-4">


      {questions.map((question,index)=>(

        <Card
          key={question.id}
          className="p-6"
        >

        <div className="flex justify-between gap-3">

          <div className="flex items-start gap-3">

          {question.status === "PENDING_REVIEW" && (
            <input
              type="checkbox"
              checked={selected.includes(question.id)}
              onChange={() =>
                toggleSelect(question.id)
              }
              className="mt-1 h-4 w-4"
            />
          )}

          <div>

          <p className="font-medium">
            Question {index+1}
          </p>


          <Badge className="mt-2">
            {question.status}
          </Badge>

          </div>

          </div>


          <Badge variant="outline">
            {question.type}
          </Badge>


        </div>



        {editing === question.id ? (

          <div className="mt-4 space-y-3">

            <Textarea
              value={question.question}
              onChange={e =>
                setQuestions(current =>
                  current.map(q =>
                    q.id===question.id
                    ? {
                      ...q,
                      question:e.target.value
                    }
                    : q
                  )
                )
              }
            />


            <Input
              type="number"
              value={question.marks}
              onChange={e =>
                setQuestions(current =>
                  current.map(q =>
                    q.id===question.id
                    ? {
                      ...q,
                      marks:Number(e.target.value)
                    }
                    : q
                  )
                )
              }
            />

            <select
              value={question.type}
              onChange={e =>
                setQuestions(current =>
                  current.map(q =>
                    q.id===question.id
                    ? {
                      ...q,
                      type:e.target.value as Question["type"]
                    }
                    : q
                  )
                )
              }
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="MCQ">
                MCQ
              </option>
              <option value="TRUE_FALSE">
                True / False
              </option>
              <option value="SHORT_ANSWER">
                Short Answer
              </option>
              <option value="LONG_ANSWER">
                Long Answer
              </option>
            </select>



            {question.type === "MCQ" &&
              question.options && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Options
                  </p>

                  {question.options.map((option,index)=>(
                    <Input
                      key={index}
                      value={option}
                      onChange={e =>
                        setQuestions(current =>
                          current.map(q =>
                            q.id===question.id
                            ? {
                              ...q,
                              options:q.options?.map(
                                (item,i)=>
                                  i===index
                                  ? e.target.value
                                  : item
                              )
                            }
                            : q
                          )
                        )
                      }
                    />
                  ))}

                  <p className="text-sm font-medium mt-3">
                    Correct Answer
                  </p>

                  <Input
                    value={question.correctAnswer ?? ""}
                    onChange={e =>
                      setQuestions(current =>
                        current.map(q =>
                          q.id===question.id
                          ? {
                            ...q,
                            correctAnswer:e.target.value
                          }
                          : q
                        )
                      )
                    }
                  />
                </div>
              )}

            {question.type === "TRUE_FALSE" && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Correct Answer
                </p>

                <select
                  value={question.correctAnswer ?? ""}
                  onChange={e =>
                    setQuestions(current =>
                      current.map(q =>
                        q.id===question.id
                        ? {
                          ...q,
                          correctAnswer:e.target.value
                        }
                        : q
                      )
                    )
                  }
                  className="h-10 w-full rounded-md border px-3"
                >
                  <option value="">
                    Select
                  </option>
                  <option value="TRUE">
                    True
                  </option>
                  <option value="FALSE">
                    False
                  </option>
                </select>
              </div>
            )}


            <div className="flex gap-2">

            <Button
              onClick={() =>
                saveEdit(question)
              }
              disabled={loading===question.id}
            >
              Save
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setEditing(null)
              }
            >
              Cancel
            </Button>

            </div>

          </div>


        ) : (

          <p className="mt-4 text-sm">
            {question.question}
          </p>

        )}




        <div className="mt-5 flex flex-wrap gap-2">


        {question.status==="PENDING_REVIEW" && (

          <>

          <Button
            variant="outline"
            onClick={() =>
              setEditing(question.id)
            }
          >
            <Pencil className="mr-2 h-4 w-4"/>
            Edit
          </Button>


          <Button
            onClick={() => {
              setApproveTarget(question.id);
              setReviewNote("");
              setApproveDialogOpen(true);
            }}
          >
            <Check className="mr-2 h-4 w-4"/>
            Approve
          </Button>


          <Button
            variant="destructive"
            onClick={() => {
              setRejectTarget(question.id);
              setReviewNote("");
              setRejectDialogOpen(true);
            }}
          >
            <X className="mr-2 h-4 w-4"/>
            Reject
          </Button>

          </>

        )}



        {question.status==="APPROVED" && (

          <Button
            onClick={() =>
              importQuestion(question.id)
            }
          >

            <Upload className="mr-2 h-4 w-4"/>

            Import To Assessment

          </Button>

        )}


        </div>


        {loading===question.id && (

          <Loader2 className="mt-3 h-4 w-4 animate-spin"/>

        )}


        </Card>

      ))}


      </div>


    </div>


    <AlertDialog
      open={approveDialogOpen}
      onOpenChange={setApproveDialogOpen}
    >

      <AlertDialogContent>

        <AlertDialogHeader>
          <AlertDialogTitle>
            Approve generated question?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Add an optional review note before approving.
          </AlertDialogDescription>
        </AlertDialogHeader>


        <Textarea
          placeholder="Approval note..."
          value={reviewNote}
          onChange={(e)=>
            setReviewNote(e.target.value)
          }
        />


        <AlertDialogFooter>

          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>


          <AlertDialogAction
            onClick={async()=>{

              if(!approveTarget) return;

              await approve(approveTarget);

              setApproveTarget(null);
              setApproveDialogOpen(false);

            }}
          >
            Approve Question
          </AlertDialogAction>

        </AlertDialogFooter>

      </AlertDialogContent>

    </AlertDialog>



    <AlertDialog
      open={rejectDialogOpen}
      onOpenChange={setRejectDialogOpen}
    >

      <AlertDialogContent>

        <AlertDialogHeader>

          <AlertDialogTitle>
            Reject generated question?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Add an optional review note before rejecting this AI generated question.
          </AlertDialogDescription>

        </AlertDialogHeader>


        <Textarea
          placeholder="Reason for rejection..."
          value={reviewNote}
          onChange={(e) =>
            setReviewNote(e.target.value)
          }
        />


        <AlertDialogFooter>

          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>


          <AlertDialogAction
            onClick={async () => {

              if(!rejectTarget) return;

              await reject(rejectTarget);

              setRejectTarget(null);
              setRejectDialogOpen(false);

            }}
          >
            Reject Question
          </AlertDialogAction>

        </AlertDialogFooter>


      </AlertDialogContent>

    </AlertDialog>

    </>
  );
}
