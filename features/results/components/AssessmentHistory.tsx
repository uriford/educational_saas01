import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Users,
  XCircle,
} from "lucide-react";

type Submission = {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  score: number;
  percentage: number;
  answeredCount: number;
  questionCount: number;
  manualGradingPending: boolean;
  passed: boolean;
  submittedAt: Date | null;
};

type History = {
  submissions: Submission[];
  totalSubmissions: number;
  completedSubmissions: number;
  inProgressSubmissions: number;
  averageScore: number;
  averagePercentage: number;
  passedCount: number;
  failedCount: number;
  pendingManualGradingCount: number;
};

export default function AssessmentHistory({
  history,
  courseId,
  assessmentId,
}: {
  history: History;
  courseId: string;
  assessmentId: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Submissions"
          value={history.totalSubmissions}
        />

        <StatCard
          icon={<FileCheck2 className="h-4 w-4" />}
          label="Completed"
          value={history.completedSubmissions}
        />

        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Passed"
          value={history.passedCount}
        />

        <StatCard
          icon={<XCircle className="h-4 w-4" />}
          label="Failed"
          value={history.failedCount}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Average Score"
          value={history.averageScore.toString()}
        />

        <MetricCard
          label="Average Percentage"
          value={`${history.averagePercentage}%`}
        />

        <MetricCard
          label="Pending Manual Grading"
          value={history.pendingManualGradingCount.toString()}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-6">
          <div>
            <h2 className="text-lg font-semibold">
              Student Assessment History
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Review every student attempt, score, answered questions,
              and grading status.
            </p>
          </div>
        </div>

        {history.submissions.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center p-8 text-center">
            <div>
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">
                No submissions yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Student attempts will appear here after they start
                the assessment.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-6 py-4 font-medium">
                    Student
                  </th>
                  <th className="px-4 py-4 font-medium">
                    Attempt
                  </th>
                  <th className="px-4 py-4 font-medium">
                    Answered
                  </th>
                  <th className="px-4 py-4 font-medium">
                    Score
                  </th>
                  <th className="px-4 py-4 font-medium">
                    Percentage
                  </th>
                  <th className="px-4 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {history.submissions.map(
                  (submission, index) => (
                    <tr
                      key={submission.id}
                      className="transition hover:bg-muted/20"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {submission.studentName}
                        </div>

                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {submission.studentCode}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        #{history.submissions.length - index}
                      </td>

                      <td className="px-4 py-4">
                        {submission.answeredCount}/
                        {submission.questionCount}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {submission.score}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {submission.percentage}%
                      </td>

                      <td className="px-4 py-4">
                        {submission.manualGradingPending ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                            <Clock3 className="h-3.5 w-3.5" />
                            Manual grading
                          </span>
                        ) : submission.status ===
                          "IN_PROGRESS" ? (
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                            In progress
                          </span>
                        ) : submission.passed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                            <XCircle className="h-3.5 w-3.5" />
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/courses/${courseId}/assessments/${assessmentId}/submissions/${submission.id}`}
                          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}
