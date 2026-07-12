"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/shared/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadDropzone } from "@/lib/uploadthing";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Receipt, Trash2 } from "lucide-react";
import Image from "next/image";

function DropzoneIcon() {
  return (
    <div className="mb-1.5 flex h-[60px] w-[60px] items-center justify-center rounded-[18px] border-2 border-ink bg-marigold shadow-[3px_3px_0_var(--ink)]">
      <Receipt style={{ height: 26, width: 26 }} stroke="#1c1b2e" strokeWidth={2} />
    </div>
  );
}

// UploadThing's own dropzone "button" only becomes clickable after a file is
// already selected some other way, so it can't be the primary CTA. The
// "label" element is what actually wraps the hidden file input and reliably
// opens the file picker on click — so the visible "Choose file" pill lives
// there instead, and the real button is hidden.
function DropzoneLabel() {
  return (
    <span className="flex flex-col items-center gap-3.5 text-center">
      <span className="font-heading text-[22px] font-extrabold text-ink">
        Drop your receipt here
      </span>
      <span className="max-w-[320px] text-sm font-semibold text-ink/60">
        or click to browse — AI extracts merchant, amount, date and
        auto-categorizes the expense ✦
      </span>
      <span className="mt-1 inline-flex h-11 items-center rounded-full bg-ink px-6.5 text-sm font-bold text-cream shadow-[3px_3px_0_var(--orange)] transition-[transform,box-shadow] duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_var(--orange)]">
        Choose file
      </span>
    </span>
  );
}

export default function ReceiptsPage() {
  const receipts = useQuery(api.receipts.getReceiptsByUser);
  const createReceipt = useMutation(api.receipts.createReceiptRecord);
  const deleteReceipt = useMutation(api.receipts.deleteReceipt);
  const processOCR = useAction(api.receiptActions.processReceiptOCR);

  async function handleDelete(id: string) {
    try {
      await deleteReceipt({ id: id as Id<"receipts"> });
      toast.success("Receipt deleted");
    } catch {
      toast.error("Failed to delete receipt");
    }
  }

  async function handleUploadComplete(res: { url: string; ufsUrl?: string; key: string }[]) {
    for (const file of res) {
      try {
        const resolvedUrl = file.ufsUrl ?? file.url;
        const receiptId = await createReceipt({
          fileUrl: resolvedUrl,
          uploadThingKey: file.key,
        });
        toast.info("Processing receipt with AI...");
        await processOCR({ receiptId, fileUrl: resolvedUrl });
        toast.success("Receipt scanned and expense added!");
      } catch {
        toast.error("Failed to process receipt");
      }
    }
  }

  return (
    <>
      <Header title="Receipt Scanner" />
      <div className="flex-1 space-y-5 overflow-y-auto p-7">
        {/* Upload area */}
        <UploadDropzone
          endpoint="receiptUploader"
          config={{ mode: "auto" }}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(err: { message: string }) => {
            toast.error(err.message);
          }}
          content={{
            uploadIcon: <DropzoneIcon />,
            label: <DropzoneLabel />,
            allowedContent: "JPG, PNG or PDF · up to 8 MB",
          }}
          appearance={{
            container:
              "group rounded-[22px] border-[3px] border-dashed border-ink bg-white px-8 py-12 flex flex-col items-center gap-3.5 cursor-pointer transition-[transform,box-shadow,background-color] duration-150 hover:bg-[#fff8ec] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--marigold)]",
            uploadIcon: "mb-0",
            label: "w-full max-w-[360px] mt-0",
            allowedContent: "text-xs font-semibold text-ink/45 mt-2",
            button: "hidden",
          }}
        />

        {/* Receipt history */}
        <p className="font-heading text-base font-bold">Recent receipts</p>

        {receipts === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-12 text-center text-ink/45">
            <Receipt className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No receipts uploaded yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {receipts.map((receipt) => (
              <div
                key={receipt._id}
                className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-white px-4.5 py-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-tint-utilities">
                  <Image
                    src={receipt.fileUrl}
                    alt="Receipt"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2.5">
                    {receipt.status === "processing" && (
                      <span className="flex items-center gap-1 rounded-full border-2 border-ink bg-tint-shopping px-2.5 py-0.5 text-[11px] font-bold text-ink">
                        <Loader2 className="h-3 w-3 animate-spin" /> Processing…
                      </span>
                    )}
                    {receipt.status === "done" && (
                      <span className="flex items-center gap-1 rounded-full border-2 border-ink bg-success-tint px-2.5 py-0.5 text-[11px] font-bold text-success">
                        <CheckCircle className="h-3 w-3" /> Scanned
                      </span>
                    )}
                    {receipt.status === "failed" && (
                      <span className="flex items-center gap-1 rounded-full border-2 border-ink bg-danger-tint px-2.5 py-0.5 text-[11px] font-bold text-danger">
                        <XCircle className="h-3 w-3" /> Failed
                      </span>
                    )}
                    <span className="text-xs font-semibold text-ink/55">
                      {formatDate(receipt.createdAt)}
                    </span>
                  </div>

                  {receipt.extractedData ? (
                    <div>
                      <p className="text-sm font-bold">{receipt.extractedData.merchant}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-ink/60">
                        <span className="font-bold text-orange">
                          {formatCurrency(receipt.extractedData.totalAmount)}
                        </span>{" "}
                        · {receipt.extractedData.category}
                        {receipt.extractedData.items.length > 0 && (
                          <>
                            {" "}
                            ·{" "}
                            {receipt.extractedData.items
                              .slice(0, 3)
                              .map((i: { name: string }) => i.name)
                              .join(", ")}
                            {receipt.extractedData.items.length > 3 &&
                              ` +${receipt.extractedData.items.length - 3} more`}
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p
                      className={cn(
                        "text-sm font-bold",
                        receipt.status === "failed" ? "text-danger" : "text-ink/60"
                      )}
                    >
                      {receipt.status === "failed"
                        ? "Couldn't read this receipt"
                        : "Reading receipt with AI…"}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(receipt._id)}
                  className="ml-1 shrink-0 text-ink/40 transition-colors hover:text-danger"
                  aria-label="Delete receipt"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
