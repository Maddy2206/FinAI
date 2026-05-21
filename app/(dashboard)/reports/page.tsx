"use client";

import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Sparkles, Mail, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ReportsPage() {
  const reports        = useQuery(api.reports.getWeeklyReports);
  const generateReport = useAction(api.reportsActions.generateWeeklyReport);
  const deleteReport   = useMutation(api.reports.deleteReport);
  const [generating, setGenerating]   = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateReport();
      toast.success("Report generated! Check your inbox for the PDF.");
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (msg.includes("Email failed")) {
        toast.warning("Report saved, but email failed — check Convex logs for details.");
      } else {
        toast.error("Failed to generate report");
      };
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteReport({ id: id as any });
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI-Generated Weekly Reports</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically sent every Monday · PDF with full analytics attached
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating} size="sm">
            <Sparkles className="h-4 w-4 mr-1.5" />
            {generating ? "Generating..." : "Generate Now"}
          </Button>
        </div>

        {reports === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No reports yet</p>
            <p className="text-sm mt-1">Click "Generate Now" to create your first weekly report</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report: any) => (
              <Card key={report._id} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold">
                        Week of {format(new Date(report.weekStart), "MMM d")}
                        {" – "}
                        {format(new Date(report.weekEnd), "MMM d, yyyy")}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">Total spent:</span>
                        <span className="text-xs font-semibold text-destructive">
                          {formatCurrency(report.totalSpent)}
                        </span>
                        <span className="text-xs text-muted-foreground">· Top: {report.topCategory}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {report.emailSentAt && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Mail className="h-3 w-3" /> Sent
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => setExpanded(expanded === report._id ? null : report._id)}
                      >
                        {expanded === report._id
                          ? <><ChevronUp className="h-3.5 w-3.5" /> Hide</>
                          : <><ChevronDown className="h-3.5 w-3.5" /> View</>
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={deleting === report._id}
                        onClick={() => handleDelete(report._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expanded === report._id && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{report.reportContent}</ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
