"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { allStories } from "@/registry/all-stories";
import { storyArgs, type Args } from "@/registry/stories";
import { Playground } from "./playground";
import { MENSAGEM, type EstadoDoPreview, type Fundo } from "./protocol";

const TELAS = [
  { id: "responsivo", rotulo: "Responsivo", largura: null },
  { id: "celular", rotulo: "Celular", largura: 390 },
  { id: "tablet", rotulo: "Tablet", largura: 768 },
  { id: "notebook", rotulo: "Notebook", largura: 1280 },
  { id: "desktop", rotulo: "Desktop", largura: 1536 },
] as const;

type TelaId = (typeof TELAS)[number]["id"];

const ABA =
  "rounded-md px-2.5 py-1 text-sm text-zinc-600 hover:bg-zinc-100 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900";

function enviar(iframe: HTMLIFrameElement | null, estado: EstadoDoPreview) {
  iframe?.contentWindow?.postMessage({ tipo: MENSAGEM.estado, estado }, location.origin);
}

function useLargura() {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [ref, largura] as const;
}

/**
 * Preview do componente num iframe: variações em abas, tamanhos de tela,
 * fundo e playground. Telas mais largas que o espaço disponível aparecem reduzidas.
 */
export function ComponentPreview({ slug, nome }: { slug: string; nome: string }) {
  const exemplos = allStories[slug];
  const [story, setStory] = useState(0);
  const [args, setArgs] = useState<Args>(() => storyArgs(exemplos, 0));
  const [tela, setTela] = useState<TelaId>("responsivo");
  const [fundo, setFundo] = useState<Fundo>("tema");
  const [altura, setAltura] = useState(240);
  const iframe = useRef<HTMLIFrameElement>(null);
  const ultimoEstado = useRef<EstadoDoPreview | null>(null);
  const [area, larguraDaArea] = useLargura();

  const usaPlayground = !exemplos.stories[story]?.render;
  const estado = useMemo<EstadoDoPreview>(
    () => ({ story, args: usaPlayground ? args : undefined, fundo }),
    [story, args, usaPlayground, fundo],
  );

  useEffect(() => {
    ultimoEstado.current = estado;
    enviar(iframe.current, estado);
  }, [estado]);

  useEffect(() => {
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== iframe.current?.contentWindow) return;
      if (e.data?.tipo === MENSAGEM.pronto && ultimoEstado.current) enviar(iframe.current, ultimoEstado.current);
      if (e.data?.tipo === MENSAGEM.altura) setAltura(Math.max(120, Number(e.data.altura) || 0));
    };
    window.addEventListener("message", aoReceber);
    return () => window.removeEventListener("message", aoReceber);
  }, []);

  function escolherStory(i: number) {
    setStory(i);
    setArgs(storyArgs(exemplos, i));
  }

  const largura = TELAS.find((t) => t.id === tela)?.largura ?? null;
  const escala = largura && larguraDaArea ? Math.min(1, larguraDaArea / largura) : 1;
  const esquerda = largura && larguraDaArea ? Math.max(0, (larguraDaArea - largura * escala) / 2) : 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="space-y-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Variações">
          <span className="mr-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Variações</span>
          {exemplos.stories.map((s, i) => (
            <button key={s.name} type="button" aria-pressed={i === story} onClick={() => escolherStory(i)} className={ABA}>
              {s.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Tamanho da tela">
            <span className="mr-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Tela</span>
            {TELAS.map((t) => (
              <button key={t.id} type="button" aria-pressed={t.id === tela} onClick={() => setTela(t.id)} className={ABA}>
                {t.rotulo}
                {t.largura && <span className="ml-1 text-xs opacity-60">{t.largura}</span>}
              </button>
            ))}
            {escala < 1 && (
              <span className="ml-2 text-xs text-zinc-500">reduzido a {Math.round(escala * 100)}%</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={fundo === "pontilhado"}
              onClick={() => setFundo((f) => (f === "pontilhado" ? "tema" : "pontilhado"))}
              className={ABA}
            >
              Pontilhado
            </button>
            <a
              href={`/preview/${slug}?variacao=${story}&fundo=${fundo}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-2.5 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Abrir em nova aba ↗
            </a>
          </div>
        </div>
      </div>

      <div ref={area} className="relative overflow-hidden" style={{ height: altura * escala }}>
        <iframe
          ref={iframe}
          src={`/preview/${slug}`}
          title={`Preview de ${nome}`}
          onLoad={() => ultimoEstado.current && enviar(iframe.current, ultimoEstado.current)}
          className="absolute top-0 block border-0"
          style={{
            left: esquerda,
            width: largura ?? "100%",
            height: altura,
            transform: escala < 1 ? `scale(${escala})` : undefined,
            transformOrigin: "top left",
          }}
        />
      </div>

      {usaPlayground ? (
        <Playground
          controles={exemplos.controls}
          valores={args}
          aoMudar={setArgs}
          aoRestaurar={() => setArgs(storyArgs(exemplos, story))}
        />
      ) : (
        <p className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
          Esta variação é uma composição fixa. Escolha outra para mexer nas props no playground.
        </p>
      )}
    </div>
  );
}
