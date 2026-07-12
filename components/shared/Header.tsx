"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { formatMonth, getCurrentMonth } from "@/lib/utils";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-[66px] shrink-0 items-center justify-between border-b-2 border-ink bg-cream px-7">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[244px] p-0">
            <Sidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="font-heading text-[22px] font-extrabold tracking-[-0.01em]">
          {title}
        </h1>
      </div>

      <span className="rounded-full border-2 border-ink bg-white px-4 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_var(--ink)]">
        {formatMonth(getCurrentMonth())}
      </span>
    </header>
  );
}
