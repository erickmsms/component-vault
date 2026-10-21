import type { ReactNode } from "react";

type BadgeProps = {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
};

const tones = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
