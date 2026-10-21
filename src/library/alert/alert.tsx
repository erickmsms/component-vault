import type { ReactNode } from "react";

type AlertProps = {
  tone?: "info" | "success" | "error";
  title: string;
  children?: ReactNode;
};

const tones = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`w-full max-w-md rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 opacity-80">{children}</div>}
    </div>
  );
}
