"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadDropzone } from "@/lib/uploadthing";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Receipt } from "lucide-react";
import Image from "next/image";

export default function ReceiptsPage() {
  const receipts = useQuery(api.receipts.getReceiptsByUser);
  const createReceipt = useMutation(api.receipts.createReceiptRecord);
  const processOCR = useAction(api.receiptActions.processReceiptOCR);

  async function handleUploadComplete(res: { url: string; key: string }[]) {
    for (const file of res) {
      try {
        const receiptId = await createReceipt({
          fileUrl: file.url,
          uploadThingKey: file.key,
        });
        toast.info("Processing receipt with AI...");
        await processOCR({ receiptId, fileUrl: file.url });
        toast.success("Receipt scanned and expense added!");
      } catch {
        toast.error("Failed to process receipt");
      }
    }
  }

  return (
    <>
      <Header title="Receipt Scanner" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload area */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-foreground mb-1">Upload Receipt</p>
            <p className="text-xs text-muted-foreground mb-3">AI will extract merchant, amount, date and auto-categorize the expense.</p>
            <UploadDropzone
              endpoint="receiptUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(err: { message: string }) => { toast.error(err.message); }}
              appearance={{
                container: "border border-dashed border-border/60 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors h-40 flex flex-col items-center justify-center gap-2 cursor-pointer mt-0",
                uploadIcon: "h-8 w-8 text-muted-foreground mb-1",
                label: "text-sm text-foreground font-medium",
                allowedContent: "text-xs text-muted-foreground",
                button: "bg-primary text-primary-foreground text-xs font-medium h-8 px-4 rounded-lg mt-1",
              }}
            />
          </CardContent>
        </Card>

        {/* Receipt history */}
        <h2 className="text-sm font-semibold text-foreground">Recent Receipts</h2>

        {receipts === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No receipts uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <Card key={receipt._id} className="border-border/50">
                <CardContent className="p-4 flex gap-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image
                      src={receipt.fileUrl}
                      alt="Receipt"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {receipt.status === "processing" && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Loader2 className="h-3 w-3 animate-spin" /> Processing
                        </Badge>
                      )}
                      {receipt.status === "done" && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 text-xs">
                          <CheckCircle className="h-3 w-3" /> Scanned
                        </Badge>
                      )}
                      {receipt.status === "failed" && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <XCircle className="h-3 w-3" /> Failed
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDate(receipt.createdAt)}</span>
                    </div>

                    {receipt.extractedData && (
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{receipt.extractedData.merchant}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-primary">{formatCurrency(receipt.extractedData.totalAmount)}</span>
                          <span>·</span>
                          <span>{receipt.extractedData.category}</span>
                          <span>·</span>
                          <span>{receipt.extractedData.date}</span>
                        </div>
                        {receipt.extractedData.items.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {receipt.extractedData.items.slice(0, 3).map((i: { name: string }) => i.name).join(", ")}
                            {receipt.extractedData.items.length > 3 && ` +${receipt.extractedData.items.length - 3} more`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
