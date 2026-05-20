"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
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
        onParsed(result as any);
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
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          className="pl-9"
          placeholder="e.g., Spent ₹450 on pizza today"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
        />
      </div>
      <Button onClick={handleParse} disabled={loading || !text.trim()} size="sm">
        {loading ? "Parsing..." : "Parse"}
      </Button>
    </div>
  );
}
