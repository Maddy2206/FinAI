"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/shared/Header";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Send, Bot, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUERIES = [
  "Why did I overspend this month?",
  "How can I save ₹5,000 more?",
  "Which subscription should I cancel?",
  "What's my biggest expense category?",
  "Am I on track with my budgets?",
];

function initialsFor(name: string | null | undefined) {
  if (!name) return "You";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function AssistantPage() {
  const messages = useQuery(api.assistant.getChatHistory);
  const sendMessage = useAction(api.assistantActions.sendMessage);
  const clearHistory = useMutation(api.assistant.clearChatHistory);
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initials = initialsFor(user?.fullName);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;

    setInput("");
    setLoading(true);
    try {
      await sendMessage({ userMessage: msg });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="AI Assistant" />
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Messages area */}
        <div className="flex-1 space-y-4.5 overflow-y-auto p-7">
          {messages === undefined ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-ink shadow-[3px_3px_0_var(--marigold)]">
                <Bot style={{ height: 28, width: 28 }} stroke="#ffb02e" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold">Your AI Financial Advisor</p>
                <p className="mt-1 text-sm text-ink/55">
                  Ask me anything about your spending, savings, or budgets.
                </p>
              </div>
              <div className="flex max-w-md flex-wrap justify-center gap-2.5">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-xs font-bold transition-colors hover:bg-marigold"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(messages as ChatMessage[]).map((msg) => (
                <div
                  key={msg._id}
                  className={cn(
                    "flex max-w-[720px] gap-3",
                    msg.role === "user" && "ml-auto flex-row-reverse"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-[2px_2px_0_var(--marigold)]">
                      <Bot style={{ height: 16, width: 16 }} stroke="#ffb02e" strokeWidth={2} />
                    </div>
                  ) : (
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-marigold font-heading text-xs font-extrabold text-ink">
                      {initials}
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-[18px] border-2 border-ink px-4.5 py-3.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "rounded-tr-[4px] bg-orange text-cream shadow-[3px_3px_0_var(--ink)]"
                        : "rounded-tl-[4px] bg-white"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex max-w-[720px] gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-[2px_2px_0_var(--marigold)]">
                    <Bot style={{ height: 16, width: 16 }} stroke="#ffb02e" strokeWidth={2} />
                  </div>
                  <div className="rounded-[18px] rounded-tl-[4px] border-2 border-ink bg-white px-4.5 py-3.5">
                    <div className="flex h-5 items-center gap-1.5">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:0ms]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:150ms]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Suggested queries (when has messages) */}
        {messages && messages.length > 0 && (
          <div className="scrollbar-none flex gap-2.5 overflow-x-auto px-7 pb-3">
            {SUGGESTED_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="shrink-0 whitespace-nowrap rounded-full border-2 border-ink bg-white px-4 py-1.5 text-xs font-bold transition-colors hover:bg-marigold"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-3 border-t-2 border-ink bg-cream px-7 py-4">
          {messages && messages.length > 0 && (
            <button
              onClick={() => clearHistory()}
              className="shrink-0 text-ink/50 transition-colors hover:text-danger"
              aria-label="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <input
            type="text"
            placeholder="Ask about your finances… ✦"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
            className="h-12 flex-1 rounded-full border-2 border-ink bg-white px-5.5 text-sm text-ink outline-none placeholder:text-ink/45 focus:shadow-[3px_3px_0_var(--marigold)] disabled:opacity-60"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-orange shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Send style={{ height: 18, width: 18 }} stroke="#faf4e8" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
}
