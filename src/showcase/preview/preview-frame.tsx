"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { allStories } from "@/registry/all-stories";
import { StoryView } from "@/registry/stories";
import { THEME_ATTR } from "@/themes/tokens";
import { MENSAGEM, type EstadoDoPreview } from "./protocol";

const semMudancas = () => () => {};

/**
 * O conteúdo do iframe de preview: uma variação do componente sobre o fundo do
 * tema. Dentro do iframe os breakpoints (sm:, md:, lg:...) seguem a largura dele,
 * como num celular ou tablet de verdade. Aberto direto numa aba, lê a variação da URL.
 */
export function PreviewFrame({ slug }: { slug: string }) {
  const exemplos = allStories[slug];
  const busca = useSyncExternalStore(semMudancas, () => location.search, () => "");
  const [doPai, setDoPai] = useState<EstadoDoPreview | null>(null);
  const moldura = useRef<HTMLDivElement>(null);
  const conteudo = useRef<HTMLDivElement>(null);

  const daUrl = new URLSearchParams(busca);
  const estado: EstadoDoPreview = doPai ?? {
    story: Number(daUrl.get("variacao")) || 0,
    fundo: daUrl.get("fundo") === "pontilhado" ? "pontilhado" : "tema",
  };

  useEffect(() => {
    const el = conteudo.current;
    const pai = moldura.current;
    if (!el || !pai || window.parent === window) return;

    // Altura = conteúdo (incluindo menus abertos que passam da borda) + o respiro da moldura
    let ultima = 0;
    const medir = (sempre = false) => {
      const estilo = getComputedStyle(pai);
      const altura = Math.ceil(el.scrollHeight + parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom));
      if (altura === ultima && !sempre) return;
      ultima = altura;
      window.parent.postMessage({ tipo: MENSAGEM.altura, altura }, location.origin);
    };

    // A página e o iframe carregam em paralelo: se a página ainda não ouvia quando o
    // iframe avisou, ela manda o estado depois, e a resposta leva a altura de novo.
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.tipo !== MENSAGEM.estado) return;
      setDoPai(e.data.estado as EstadoDoPreview);
      setTimeout(() => medir(true), 50);
    };
    window.addEventListener("message", aoReceber);
    window.parent.postMessage({ tipo: MENSAGEM.pronto }, location.origin);

    const tamanho = new ResizeObserver(() => medir());
    tamanho.observe(el);
    const mudancas = new MutationObserver(() => medir());
    mudancas.observe(el, { subtree: true, childList: true, attributes: true });
    medir(true);
    return () => {
      window.removeEventListener("message", aoReceber);
      tamanho.disconnect();
      mudancas.disconnect();
    };
  }, []);

  if (!exemplos) return <p className="p-6 text-sm">Componente sem exemplos.</p>;

  return (
    <div
      ref={moldura}
      data-theme={THEME_ATTR}
      data-variacoes={exemplos.stories.length}
      className={`flex min-h-dvh items-center bg-page p-6 sm:p-10 ${estado.fundo === "pontilhado" ? "preview-dots" : ""}`}
    >
      {/* A raiz do exemplo não passa da largura disponível (flex não deixa encolher abaixo do conteúdo) */}
      <div ref={conteudo} className="flex w-full justify-center-safe [&>*]:max-w-full [&>*]:min-w-0">
        <StoryView exemplos={exemplos} index={estado.story} args={estado.args} />
      </div>
    </div>
  );
}
