"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Bot, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SUGGESTED_QUERIES = [
  "Why did I overspend this month?",
  "How can I save ₹5,000 more?",
  "Which subscription should I cancel?",
  "What's my biggest expense category?",
  "Am I on track with my budgets?",
];

export default function AssistantPage() {
  const messages = useQuery(api.assistant.getChatHistory);
  const sendMessage = useAction(api.assistantActions.sendMessage);
  const clearHistory = useMutation(api.assistant.clearChatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages === undefined ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Your AI Financial Advisor</p>
                <p className="text-sm text-muted-foreground mt-1">Ask me anything about your spending, savings, or budgets.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 bg-card border border-border rounded-full text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg: any) => (
                <div
                  key={msg._id}
                  className={cn("flex gap-3 max-w-3xl", (msg as any).role === "user" ? "ml-auto flex-row-reverse" : "")}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user" ? "bg-primary" : "bg-card border border-border"
                  )}>
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm max-w-[80%]",
                    (msg as any).role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  )}>
                    {(msg as any).role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center">
                    <Bot className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5 items-center h-5">
                      <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
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
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            {SUGGESTED_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 bg-card border border-border rounded-full text-muted-foreground hover:text-foreground hover:border-primary whitespace-nowrap transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2 max-w-3xl mx-auto">
            {messages && messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => clearHistory()}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-4"
                placeholder="Ask about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={loading}
              />
            </div>
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
