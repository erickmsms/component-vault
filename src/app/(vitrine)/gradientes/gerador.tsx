"use client";

import { useRef, useState, type PointerEvent } from "react";

type Blob = { id: number; cor: string; x: number; y: number; raio: number; opacidade: number };
type Estado = { fundo: string; blobs: Blob[]; grao: boolean; blur: number };

const PRESETS: { nome: string; estado: Estado }[] = [
  {
    nome: "Oceano",
    estado: {
      fundo: "#ffffff",
      grao: false,
      blur: 0,
      blobs: [
        { id: 1, cor: "#2563eb", x: 8, y: 10, raio: 60, opacidade: 1 },
        { id: 2, cor: "#22b8cf", x: 92, y: 95, raio: 55, opacidade: 0.9 },
      ],
    },
  },
  {
    nome: "Pôr do sol",
    estado: {
      fundo: "#fff7ed",
      grao: true,
      blur: 0,
      blobs: [
        { id: 1, cor: "#f97316", x: 15, y: 85, raio: 60, opacidade: 0.9 },
        { id: 2, cor: "#ec4899", x: 85, y: 15, raio: 55, opacidade: 0.8 },
        { id: 3, cor: "#facc15", x: 50, y: 110, raio: 45, opacidade: 0.7 },
      ],
    },
  },
  {
    nome: "Aurora",
    estado: {
      fundo: "#0b1020",
      grao: true,
      blur: 0,
      blobs: [
        { id: 1, cor: "#22c55e", x: 20, y: 20, raio: 55, opacidade: 0.8 },
        { id: 2, cor: "#8b5cf6", x: 80, y: 30, raio: 55, opacidade: 0.8 },
        { id: 3, cor: "#06b6d4", x: 50, y: 100, raio: 60, opacidade: 0.7 },
      ],
    },
  },
];

const GRAO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")";

function hexComAlfa(hex: string, alfa: number) {
  return hex + Math.round(alfa * 255).toString(16).padStart(2, "0");
}

function camadas(estado: Estado) {
  return estado.blobs
    .map((b) => `radial-gradient(${b.raio}% ${Math.round(b.raio * 1.3)}% at ${b.x}% ${b.y}%, ${hexComAlfa(b.cor, b.opacidade)}, transparent 70%)`)
    .join(",\n    ");
}

function gerarCss(estado: Estado) {
  const linhas = [`background-color: ${estado.fundo};`];
  if (estado.blobs.length) linhas.push(`background-image:\n    ${camadas(estado)};`);
  return linhas.join("\n");
}

// Paleta harmônica: matizes vizinhos a partir de um matiz base aleatório
function hslParaHex(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function aleatorio(): Estado {
  const base = Math.random() * 360;
  const escuro = Math.random() < 0.25;
  const qtd = 2 + Math.floor(Math.random() * 2);
  const cantos = [
    [10, 10],
    [90, 90],
    [90, 10],
    [10, 90],
    [50, 105],
  ].sort(() => Math.random() - 0.5);
  return {
    fundo: escuro ? hslParaHex(base, 40, 8) : hslParaHex(base, 60, 98),
    grao: Math.random() < 0.5,
    blur: 0,
    blobs: Array.from({ length: qtd }, (_, i) => ({
      id: i + 1,
      cor: hslParaHex((base + i * (25 + Math.random() * 30)) % 360, 75 + Math.random() * 20, 50 + Math.random() * 10),
      x: Math.round(cantos[i][0] + (Math.random() * 16 - 8)),
      y: Math.round(cantos[i][1] + (Math.random() * 16 - 8)),
      raio: 45 + Math.round(Math.random() * 20),
      opacidade: 0.75 + Math.round(Math.random() * 25) / 100,
    })),
  };
}

export function GeradorDeGradientes() {
  const [estado, setEstado] = useState<Estado>(PRESETS[0].estado);
  const [selecionado, setSelecionado] = useState(1);
  const [copiado, setCopiado] = useState(false);
  const [mostrarAlcas, setMostrarAlcas] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const arrastando = useRef<number | null>(null);

  const blob = estado.blobs.find((b) => b.id === selecionado);
  const css = gerarCss(estado);

  function atualizarBlob(id: number, parcial: Partial<Blob>) {
    setEstado((e) => ({ ...e, blobs: e.blobs.map((b) => (b.id === id ? { ...b, ...parcial } : b)) }));
  }

  function adicionar() {
    const id = Math.max(0, ...estado.blobs.map((b) => b.id)) + 1;
    setEstado((e) => ({ ...e, blobs: [...e.blobs, { id, cor: "#8b5cf6", x: 50, y: 50, raio: 50, opacidade: 0.8 }] }));
    setSelecionado(id);
  }

  function remover(id: number) {
    setEstado((e) => ({ ...e, blobs: e.blobs.filter((b) => b.id !== id) }));
  }

  function mover(ev: PointerEvent) {
    const id = arrastando.current;
    const caixa = previewRef.current?.getBoundingClientRect();
    if (id === null || !caixa) return;
    atualizarBlob(id, {
      x: Math.round(((ev.clientX - caixa.left) / caixa.width) * 100),
      y: Math.round(((ev.clientY - caixa.top) / caixa.height) * 100),
    });
  }

  async function copiar() {
    await navigator.clipboard.writeText(css);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gradientes</h1>
        <p className="text-sm text-zinc-500">Combine manchas de cor sobre um fundo e copie o CSS. Arraste os pontos no preview.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div
          ref={previewRef}
          onPointerMove={mover}
          onPointerUp={() => (arrastando.current = null)}
          onPointerLeave={() => (arrastando.current = null)}
          className="relative aspect-[16/9] touch-none overflow-hidden rounded-3xl border border-zinc-200 select-none dark:border-zinc-800"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: estado.fundo,
              backgroundImage: estado.blobs.length ? camadas(estado) : undefined,
              filter: estado.blur ? `blur(${estado.blur}px)` : undefined,
              transform: estado.blur ? "scale(1.1)" : undefined,
            }}
          />
          {estado.grao && <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: GRAO }} />}
          {mostrarAlcas &&
            estado.blobs.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Mover mancha ${b.id}`}
                onPointerDown={(ev) => {
                  ev.currentTarget.setPointerCapture(ev.pointerId);
                  arrastando.current = b.id;
                  setSelecionado(b.id);
                }}
                className={`absolute size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 shadow-md active:cursor-grabbing ${
                  b.id === selecionado ? "border-white ring-2 ring-zinc-900" : "border-white"
                }`}
                style={{ left: `${b.x}%`, top: `${b.y}%`, backgroundColor: b.cor }}
              />
            ))}
        </div>

        <aside className="space-y-5 text-sm">
          <section className="space-y-2">
            <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Presets</h2>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.nome}
                  type="button"
                  onClick={() => {
                    setEstado(p.estado);
                    setSelecionado(p.estado.blobs[0]?.id ?? 0);
                  }}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 py-1 pr-3 pl-1 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <span className="size-5 rounded-full" style={{ backgroundColor: p.estado.fundo, backgroundImage: camadas(p.estado) }} />
                  {p.nome}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const novo = aleatorio();
                  setEstado(novo);
                  setSelecionado(1);
                }}
                className="rounded-full bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Aleatório
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Manchas</h2>
              <button type="button" onClick={adicionar} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                + Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {estado.blobs.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelecionado(b.id)}
                  aria-label={`Selecionar mancha ${b.id}`}
                  className={`size-8 rounded-full border-2 ${b.id === selecionado ? "border-zinc-900 dark:border-zinc-100" : "border-transparent"}`}
                  style={{ backgroundColor: b.cor }}
                />
              ))}
            </div>
            {blob && (
              <div className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <label className="flex items-center justify-between gap-3">
                  Cor
                  <input type="color" value={blob.cor} onChange={(e) => atualizarBlob(blob.id, { cor: e.target.value })} className="h-7 w-12 cursor-pointer bg-transparent" />
                </label>
                <Controle rotulo="Tamanho" valor={blob.raio} min={10} max={100} onChange={(v) => atualizarBlob(blob.id, { raio: v })} />
                <Controle rotulo="Opacidade" valor={Math.round(blob.opacidade * 100)} min={0} max={100} onChange={(v) => atualizarBlob(blob.id, { opacidade: v / 100 })} />
                <Controle rotulo="X" valor={blob.x} min={-20} max={120} onChange={(v) => atualizarBlob(blob.id, { x: v })} />
                <Controle rotulo="Y" valor={blob.y} min={-20} max={120} onChange={(v) => atualizarBlob(blob.id, { y: v })} />
                <button type="button" onClick={() => remover(blob.id)} className="text-red-600 hover:underline">
                  Remover mancha
                </button>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Fundo e efeitos</h2>
            <label className="flex items-center justify-between gap-3">
              Cor de fundo
              <input type="color" value={estado.fundo} onChange={(e) => setEstado((s) => ({ ...s, fundo: e.target.value }))} className="h-7 w-12 cursor-pointer bg-transparent" />
            </label>
            <Controle rotulo="Desfoque" valor={estado.blur} min={0} max={60} onChange={(v) => setEstado((s) => ({ ...s, blur: v }))} />
            <label className="flex items-center justify-between gap-3">
              Grão
              <input type="checkbox" checked={estado.grao} onChange={(e) => setEstado((s) => ({ ...s, grao: e.target.checked }))} />
            </label>
            <label className="flex items-center justify-between gap-3">
              Mostrar pontos
              <input type="checkbox" checked={mostrarAlcas} onChange={(e) => setMostrarAlcas(e.target.checked)} />
            </label>
          </section>
        </aside>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">CSS</h2>
          <button type="button" onClick={copiar} className="rounded-full border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
            {copiado ? "Copiado!" : "Copiar CSS"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
          <code>{css}</code>
        </pre>
        {(estado.grao || estado.blur > 0) && (
          <p className="text-xs text-zinc-500">Grão e desfoque são efeitos do preview e não entram no CSS copiado.</p>
        )}
      </section>
    </div>
  );
}

function Controle({ rotulo, valor, min, max, onChange }: { rotulo: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="flex justify-between">
        {rotulo}
        <span className="text-zinc-500 tabular-nums">{valor}</span>
      </span>
      <input type="range" min={min} max={max} value={valor} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
