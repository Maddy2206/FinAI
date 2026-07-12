"use client";

import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Mail, Trash2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Id } from "@/convex/_generated/dataModel";

export default function ReportsPage() {
  const reports = useQuery(api.reports.getWeeklyReports);
  const generateReport = useAction(api.reportsActions.generateWeeklyReport);
  const deleteReport = useMutation(api.reports.deleteReport);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateReport();
      toast.success("Report generated! Check your inbox for the PDF.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Email failed")) {
        toast.warning("Report saved, but email failed — check Convex logs for details.");
      } else {
        toast.error("Failed to generate report");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteReport({ id: id as Id<"weekly_reports"> });
      toast.success("Report deleted");
      if (expanded === id) setExpanded(null);
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <Header title="Weekly Reports" />
      <div className="flex-1 space-y-5 overflow-y-auto p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading text-[17px] font-bold">AI-generated weekly reports</p>
            <p className="mt-1 text-[13px] font-semibold text-ink/60">
              Automatically sent every Monday · PDF with full analytics attached
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating…" : "Generate now"}
          </Button>
        </div>

        {reports === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-[18px]" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-ink/50">
            <Sparkles className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="font-bold">No reports yet</p>
            <p className="mt-1 text-sm">Click &quot;Generate now&quot; to create your first weekly report</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reports.map((report) => {
              const isExpanded = expanded === report._id;
              return (
                <div
                  key={report._id}
                  className={cn(
                    "rounded-[18px] border-2 border-ink bg-white p-6",
                    isExpanded && "shadow-[4px_4px_0_var(--marigold)]"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-heading text-lg font-extrabold">
                        Week of {format(new Date(report.weekStart), "MMM d")}
                        {" – "}
                        {format(new Date(report.weekEnd), "MMM d, yyyy")}
                      </p>
                      <p className="mt-1.5 text-[13px] font-semibold text-ink/60">
                        Total spent:{" "}
                        <span className="font-bold text-orange">
                          {formatCurrency(report.totalSpent)}
                        </span>{" "}
                        · Top category: {report.topCategory}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">
                      {report.emailSentAt && (
                        <span className="flex items-center gap-1 rounded-full border-2 border-ink bg-success-tint px-3.5 py-1 text-xs font-bold text-success">
                          <Mail className="h-3 w-3" /> Sent
                        </span>
                      )}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : report._id)}
                        className="flex items-center gap-1 rounded-full border-2 border-ink px-3.5 py-1 text-xs font-bold transition-colors hover:bg-marigold"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" /> Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" /> View
                          </>
                        )}
                      </button>
                      <button
                        disabled={deleting === report._id}
                        onClick={() => handleDelete(report._id)}
                        className="text-ink/40 transition-colors hover:text-danger disabled:opacity-50"
                        aria-label="Delete report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 rounded-[14px] border-2 border-ink/15 bg-cream p-5 text-sm leading-relaxed">
                      <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{report.reportContent}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
