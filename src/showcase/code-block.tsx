"use client";

import { useState } from "react";

export function CodeBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <pre className="max-h-[32rem] overflow-auto bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
