"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  Loader2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { generateAIQuestionsAction } from "../actions/ai-question-generation.actions";
import { uploadAISourceDocumentAction } from "@/features/ai-source-documents/actions/upload-source-document.action";
import { getAISourceDocumentsAction } from "../actions/ai-source-document-list.actions";

type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER";

type SourceDocument = {
  id: string;
  name: string;
  fileName: string;
  status: string;
  pageCount: number | null;
  fileSize: number | null;
  createdAt: Date;
};

type GeneratedQuestion = {
  question: string;
  type: QuestionType;
  marks: number;
  options?: string[];
  correctAnswer?: string | null;
  explanation?: string | null;
  sourceReference?: string | null;
};

type Props = {
  courseId: string;
  assessmentId: string;
  assessmentTitle: string;
};

const QUESTION_TYPES: {
  value: QuestionType;
  label: string;
  description: string;
}[] = [
  {
    value: "MCQ",
    label: "Multiple Choice",
    description: "Questions with selectable options",
  },
  {
    value: "TRUE_FALSE",
    label: "True / False",
    description: "Binary true or false questions",
  },
  {
    value: "SHORT_ANSWER",
    label: "Short Answer",
    description: "Brief written responses",
  },
  {
    value: "LONG_ANSWER",
    label: "Long Answer",
    description: "Detailed written responses",
  },
];

export default function AIQuestionGenerator({
  courseId,
  assessmentId,
  assessmentTitle,
}: Props) {
  const router = useRouter();

  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    "MCQ",
  ]);
  const [difficulty, setDifficulty] = useState("medium");
  const [instructions, setInstructions] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setLoadingDocuments(true);
      setError("");

      try {
        const result = await getAISourceDocumentsAction();

        if (cancelled) return;

        if (!result.success) {
          setDocuments([]);
          setError(result.message);
          return;
        }

        setDocuments(result.documents as SourceDocument[]);
      } catch (loadError) {
        console.error(
          "LOAD AI SOURCE DOCUMENTS ERROR:",
          loadError,
        );

        if (!cancelled) {
          setDocuments([]);
          setError(
            "Unable to load source documents. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDocuments(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUpload() {
    setError("");
    setSuccess("");

    if (!uploadName.trim()) {
      setError("Enter a name for the source document.");
      return;
    }

    if (!uploadFile) {
      setError("Select a PDF file to upload.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadAISourceDocumentAction({
        name: uploadName.trim(),
        description:
          "AI assessment source document uploaded from the assessment generator.",
        file: uploadFile,
      });

      if (!result.success) {
        const uploadMessage =
          typeof result.message === "string"
            ? result.message
            : "Failed to upload and process the PDF.";

        setError(uploadMessage);
        return;
      }

      if (result.document) {
        const uploadedDocument = result.document;

        setDocuments((current) => [
          uploadedDocument as SourceDocument,
          ...current,
        ]);

        setSelectedDocuments((current) => [
          ...current,
          uploadedDocument.id,
        ]);
      }

      setUploadName("");
      setUploadFile(null);

      const fileInput = document.getElementById(
        "ai-source-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccess(
        `Source document "${result.document?.name ?? uploadName}" is ready for AI generation.`,
      );
    } catch (uploadError) {
      console.error(
        "UPLOAD AI SOURCE DOCUMENT CLIENT ERROR:",
        uploadError,
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload and process the PDF. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function toggleDocument(id: string) {
    setSelectedDocuments((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleQuestionType(type: QuestionType) {
    setQuestionTypes((current) =>
      current.includes(type)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  async function handleGenerate() {
    setError("");
    setSuccess("");
    setQuestions([]);

    if (selectedDocuments.length === 0) {
      setError("Select at least one ready source document.");
      return;
    }

    if (questionCount < 1 || questionCount > 100) {
      setError("Question count must be between 1 and 100.");
      return;
    }

    if (questionTypes.length === 0) {
      setError("Select at least one question type.");
      return;
    }

    setGenerating(true);

    try {
      const result = await generateAIQuestionsAction({
        assessmentId,
        title: `${assessmentTitle} — AI Generated Questions`,
        description:
          "Questions generated from administrator-selected source documents.",
        sourceDocumentIds: selectedDocuments,
        questionCount,
        questionTypes,
        difficulty,
        instructions,
      });

      if ("message" in result && !("questions" in result)) {
        setError(result.message ?? "Failed to generate questions.");
        return;
      }

      if (!("questions" in result)) {
        setError("AI generation completed without returning questions.");
        return;
      }

      const generatedQuestions: GeneratedQuestion[] =
        (result.questions ?? []).map((question) => ({
          question: question.question,
          type: question.type as QuestionType,
          marks: Number(question.marks),
          options:
            Array.isArray(question.options)
              ? question.options.map(String)
              : undefined,
          correctAnswer: question.correctAnswer,
          explanation: null,
          sourceReference: null,
        }));

      if (result.generationId) {
        router.push(
          `/courses/${courseId}/assessments/${assessmentId}/questions/ai-review/${result.generationId}`,
        );
        return;
      }

      setQuestions(generatedQuestions);

      setSuccess(
        `Successfully generated ${generatedQuestions.length} questions.`,
      );
    } catch (generationError) {
      console.error(generationError);
      setError(
        "Something went wrong while generating the questions.",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="text-base font-semibold sm:text-lg">
              Generate Questions with AI
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Generate source-grounded assessment questions from
              your organization&apos;s approved PDF materials.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl border bg-card">
          <div className="border-b p-4 sm:p-6">
            <h3 className="font-semibold">Source Documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Select the PDF materials the AI is allowed to use.
            </p>
          </div>

          <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div className="rounded-lg border border-dashed bg-muted/20 p-3 sm:p-4">
              <div>
                <p className="text-sm font-medium">
                  Upload a new PDF source
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  PDF only, maximum 10 MB. The document will be
                  processed and made available to the AI immediately.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={uploadName}
                  onChange={(event) =>
                    setUploadName(event.target.value)
                  }
                  placeholder="Source document name"
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  disabled={uploading}
                />

                <input
                  id="ai-source-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) =>
                    setUploadFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full min-w-0 max-w-full text-xs sm:text-sm"
                  disabled={uploading}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={
                    uploading ||
                    !uploadName.trim() ||
                    !uploadFile
                  }
                  onClick={handleUpload}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Upload & Process PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {loadingDocuments ? (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading source documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

                <h4 className="mt-3 font-medium">
                  No source documents yet
                </h4>

                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Upload and process PDF source materials before
                  generating questions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => {
                  const ready = document.status === "READY";
                  const selected = selectedDocuments.includes(
                    document.id,
                  );

                  return (
                    <button
                      key={document.id}
                      type="button"
                      disabled={!ready}
                      onClick={() => toggleDocument(document.id)}
                      className={[
                        "flex w-full min-w-0 items-start gap-2.5 rounded-lg border p-3 text-left transition sm:gap-3 sm:p-4",
                        ready
                          ? "hover:bg-muted/50"
                          : "cursor-not-allowed opacity-50",
                        selected
                          ? "border-primary bg-primary/5"
                          : "",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background",
                        ].join(" ")}
                      >
                        {selected && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">
                          {document.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {document.fileName}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            {document.status}
                          </span>

                          {document.pageCount !== null && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {document.pageCount} pages
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border bg-card">
          <div className="border-b p-4 sm:p-6">
            <h3 className="font-semibold">Generation Settings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure what the AI should generate.
            </p>
          </div>

          <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div>
              <label className="text-sm font-medium">
                Number of Questions
              </label>

              <input
                type="number"
                min={1}
                max={100}
                value={questionCount}
                onChange={(event) =>
                  setQuestionCount(
                    Number(event.target.value),
                  )
                }
                className="mt-2 flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Question Types
              </label>

              <div className="mt-3 space-y-2">
                {QUESTION_TYPES.map((type) => {
                  const selected = questionTypes.includes(
                    type.value,
                  );

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        toggleQuestionType(type.value)
                      }
                      className={[
                        "w-full min-w-0 rounded-lg border p-3 text-left transition",
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "flex h-5 w-5 items-center justify-center rounded border",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "",
                          ].join(" ")}
                        >
                          {selected && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {type.label}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value)
                }
                className="mt-2 flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Additional Instructions
              </label>

              <textarea
                value={instructions}
                onChange={(event) =>
                  setInstructions(event.target.value)
                }
                placeholder="Example: Focus on definitions and important concepts."
                rows={4}
                className="mt-2 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="button"
              className="w-full"
              size="lg"
              disabled={
                generating ||
                loadingDocuments ||
                selectedDocuments.length === 0
              }
              onClick={handleGenerate}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <WandSparkles className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="min-w-0 rounded-xl border bg-card">
          <div className="border-b p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Generated Questions
                </h3>

                <p className="text-sm text-muted-foreground">
                  Review the AI-generated questions before
                  importing them into the assessment.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {questions.map((question, index) => (
              <div
                key={`${index}-${question.question}`}
                className="min-w-0 p-4 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Question {index + 1}
                  </span>

                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {question.type}
                  </span>

                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {question.marks} marks
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6">
                  {question.question}
                </p>

                {question.options &&
                  question.options.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {question.options.map(
                        (option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            <span className="mr-2 font-medium">
                              {String.fromCharCode(
                                65 + optionIndex,
                              )}
                              .
                            </span>
                            {option}
                          </div>
                        ),
                      )}
                    </div>
                  )}

                {question.correctAnswer && (
                  <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="font-medium">
                      Correct answer:
                    </span>{" "}
                    {question.correctAnswer}
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Explanation:
                    </span>{" "}
                    {question.explanation}
                  </div>
                )}

                {question.sourceReference && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Source: {question.sourceReference}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
