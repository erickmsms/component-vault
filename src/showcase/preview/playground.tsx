"use client";

import type { ArgValue, Args, Control } from "@/registry/stories";

const CAMPO =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300";

function Campo({
  nome,
  controle,
  valor,
  aoMudar,
}: {
  nome: string;
  controle: Control;
  valor: ArgValue;
  aoMudar: (v: ArgValue) => void;
}) {
  const rotulo = controle.label ?? nome;

  if (controle.type === "boolean") {
    const ligado = Boolean(valor);
    const segmento = (ativo: boolean) =>
      `rounded text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        ativo
          ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`;
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-zinc-500">{rotulo}</span>
        <div
          role="group"
          aria-label={rotulo}
          className="grid h-9 grid-cols-2 gap-1 rounded-md border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <button type="button" aria-pressed={ligado} onClick={() => aoMudar(true)} className={segmento(ligado)}>
            Sim
          </button>
          <button type="button" aria-pressed={!ligado} onClick={() => aoMudar(false)} className={segmento(!ligado)}>
            Não
          </button>
        </div>
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-xs text-zinc-500">{rotulo}</span>
      {controle.type === "select" ? (
        <select value={String(valor)} onChange={(e) => aoMudar(e.target.value)} className={CAMPO}>
          {controle.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : controle.type === "number" ? (
        <input
          type="number"
          value={Number(valor)}
          min={controle.min}
          max={controle.max}
          step={controle.step ?? 1}
          onChange={(e) => {
            if (e.target.value === "") return;
            const n = Number(e.target.value);
            const limitado = Math.min(controle.max ?? Infinity, Math.max(controle.min ?? -Infinity, n));
            aoMudar(limitado);
          }}
          className={CAMPO}
        />
      ) : controle.type === "color" ? (
        <input type="color" value={String(valor)} onChange={(e) => aoMudar(e.target.value)} className="h-9 w-16" />
      ) : (
        <input type="text" value={String(valor)} onChange={(e) => aoMudar(e.target.value)} className={CAMPO} />
      )}
    </label>
  );
}

/** Controles que mudam as props da variação ao vivo. */
export function Playground({
  controles,
  valores,
  aoMudar,
  aoRestaurar,
}: {
  controles: Partial<Record<string, Control>>;
  valores: Args;
  aoMudar: (valores: Args) => void;
  aoRestaurar: () => void;
}) {
  const nomes = Object.keys(valores).filter((n) => controles[n]);
  return (
    <div className="space-y-3 border-t border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Playground</h3>
        <button
          type="button"
          onClick={aoRestaurar}
          className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Restaurar valores
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-x-4 gap-y-3">
        {nomes.map((nome) => (
          <Campo
            key={nome}
            nome={nome}
            controle={controles[nome]!}
            valor={valores[nome]}
            aoMudar={(v) => aoMudar({ ...valores, [nome]: v })}
          />
        ))}
      </div>
    </div>
  );
}
