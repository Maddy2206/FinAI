"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = [
  "🍕", "🍔", "🍜", "☕", "🍰", "🍎",
  "🛒", "🛍️", "📦", "👗", "👟", "💄",
  "🚗", "🚕", "🚌", "✈️", "⛽", "🚲",
  "🏠", "⚡", "💧", "📶", "🔧", "🧾",
  "🎬", "🎮", "📺", "🎵", "🎉", "🎫",
  "🏥", "💊", "🏋️", "🧘", "📚", "🎓",
  "📱", "💻", "💳", "🎁", "🐶", "💰",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border-2 border-ink bg-white text-2xl transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--marigold)]",
          className
        )}
        aria-label="Choose an emoji"
      >
        {value}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[268px]">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50">
          Pick an icon
        </p>
        <div className="grid grid-cols-6 gap-1">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[10px] border-2 text-lg transition-colors",
                emoji === value
                  ? "border-ink bg-marigold"
                  : "border-transparent hover:border-ink hover:bg-cream"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
