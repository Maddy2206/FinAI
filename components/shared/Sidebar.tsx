"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Bot,
  FileText,
  Wallet,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/reports", label: "Reports", icon: FileText },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="flex h-full w-[244px] flex-col bg-ink text-cream">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b-2 border-cream/10 px-5.5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-cream bg-orange shadow-[2px_2px_0_rgba(250,244,232,0.4)]">
          <TrendingUp style={{ height: 15, width: 15 }} stroke="#faf4e8" strokeWidth={2.5} />
        </div>
        <span className="font-heading text-[19px] font-extrabold">
          Fin<span className="text-marigold">AI</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-cream/60 hover:text-cream lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors",
                isActive
                  ? "bg-orange text-cream"
                  : "text-cream/65 hover:bg-cream/[0.08]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 border-t-2 border-cream/10 px-5.5 py-4">
        <UserButton appearance={{ elements: { avatarBox: "h-[34px] w-[34px]" } }} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold">
            {user?.fullName ?? "Your account"}
          </p>
          <p className="text-[11px] text-cream/50">Free plan</p>
        </div>
      </div>
    </div>
  );
}
