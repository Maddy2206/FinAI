"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface NaturalLanguageInputProps {
  onParsed: (data: { amount: number; category: string; description: string; date: number }) => void;
}

export function NaturalLanguageInput({ onParsed }: NaturalLanguageInputProps) {
  const parseExpense = useAction(api.nlp.parseNaturalLanguageExpense);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleParse() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await parseExpense({ text });
      if (result) {
        onParsed(result);
        setText("");
        toast.success("Expense parsed! Review and confirm.");
      } else {
        toast.error("Couldn't parse that. Try: 'Spent ₹450 on pizza today'");
      }
    } catch {
      toast.error("Parse failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[18px] border-2 border-ink bg-ink px-6 py-5 text-cream shadow-[4px_4px_0_var(--marigold)]">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-marigold">
        ✦ AI quick entry
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder='Try "Spent ₹450 on pizza today"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
          className="flex-1 rounded-xl border-2 border-cream/30 bg-cream/[0.08] px-4 py-3.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-marigold"
        />
        <button
          onClick={handleParse}
          disabled={loading || !text.trim()}
          className="rounded-xl border-2 border-cream bg-marigold px-6 text-sm font-bold text-ink transition-colors hover:bg-orange hover:text-cream disabled:opacity-50"
        >
          {loading ? "Parsing…" : "Parse ✦"}
        </button>
      </div>
    </div>
  );
}
