"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TAMANHOS = { sm: "size-6", md: "size-8", lg: "size-10" } as const;

/** Arco-íris do botão de cor personalizada, com as cores categóricas do tema. */
const ARCO_IRIS =
  "conic-gradient(var(--series-1), var(--series-2), var(--series-3), var(--series-4), var(--series-5), var(--series-6), var(--series-7), var(--series-8), var(--series-1))";

/** Distância (px) entre o gatilho e o balão, e margem mínima até a borda da janela. */
const DISTANCIA = 6;
const MARGEM = 8;

/**
 * Converte "#abc", "#aabbcc" e "rgb(r, g, b)" no "#rrggbb" que o `<input type="color">`
 * aceita. Outros formatos caem em preto (o seletor nativo só abre nessa cor).
 */
function paraHex(cor: string): string {
  const texto = cor.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(texto)) return texto;
  if (/^#[0-9a-f]{3}$/.test(texto)) return `#${[...texto.slice(1)].map((c) => c + c).join("")}`;
  const rgb = texto.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (rgb) return `#${rgb.slice(1, 4).map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0")).join("")}`;
  return "#000000";
}

const mesmaCor = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

type Visual = { formato: "redondo" | "quadrado"; tamanho: keyof typeof TAMANHOS };

function classesDaAmostra({ formato, tamanho }: Visual, selecionada: boolean) {
  return `${TAMANHOS[tamanho]} ${formato === "redondo" ? "rounded-full" : "rounded-md"} shrink-0 cursor-pointer ring-1 ring-ink/15 ring-inset outline-offset-2 transition-transform motion-safe:hover:scale-110 focus-visible:outline-2 focus-visible:outline-ink ${
    selecionada ? "outline-2 outline-accent" : ""
  }`;
}

type Textos = { rotulo: string; personalizada: string; corAtual: string; nomeDaCor: (cor: string) => string };

/** A paleta em si: amostras, a cor atual quando é personalizada e o botão de outra cor. */
function Paleta({
  cores,
  valor,
  visual,
  comPersonalizada,
  textos,
  aoEscolher,
}: {
  cores: string[];
  valor: string;
  visual: Visual;
  comPersonalizada: boolean;
  textos: Textos;
  aoEscolher: (cor: string, origem: "amostra" | "personalizada") => void;
}) {
  const personalizada = valor !== "" && !cores.some((c) => mesmaCor(c, valor));
  return (
    <div role="group" aria-label={textos.rotulo} className="flex flex-wrap items-center gap-2.5">
      {/* Cor fora da paleta: aparece antes das amostras, sempre marcada */}
      {personalizada && (
        <button
          type="button"
          aria-pressed="true"
          aria-label={`${textos.corAtual}: ${valor}`}
          title={valor}
          onClick={() => aoEscolher(valor, "amostra")}
          className={classesDaAmostra(visual, true)}
          style={{ background: valor }}
        />
      )}
      {cores.map((cor) => {
        const selecionada = mesmaCor(cor, valor);
        return (
          <button
            key={cor}
            type="button"
            aria-pressed={selecionada}
            aria-label={textos.nomeDaCor(cor)}
            title={textos.nomeDaCor(cor)}
            onClick={() => aoEscolher(cor, "amostra")}
            className={classesDaAmostra(visual, selecionada)}
            style={{ background: cor }}
          />
        );
      })}
      {comPersonalizada && (
        // O seletor nativo fica invisível por cima do arco-íris: o clique cai direto nele
        <label
          title={textos.personalizada}
          className={`${classesDaAmostra(visual, false)} relative grid place-items-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink`}
          style={{ background: ARCO_IRIS }}
        >
          <span aria-hidden="true" className="grid size-1/2 min-h-3 min-w-3 place-items-center rounded-full bg-page text-ink">
            <svg viewBox="0 0 12 12" className="size-2/3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 2.5v7M2.5 6h7" />
            </svg>
          </span>
          <input
            type="color"
            aria-label={textos.personalizada}
            value={paraHex(valor)}
            onChange={(e) => aoEscolher(e.target.value, "personalizada")}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
      )}
    </div>
  );
}

/**
 * Escolha de cor por amostras prontas, com a opção de qualquer outra cor pelo
 * seletor nativo do navegador. A amostra escolhida ganha um anel na cor de
 * destaque; uma cor fora da paleta aparece como amostra extra, já marcada. No modo
 * compacto, vira uma bolinha com a cor atual que abre a paleta num balão.
 */
export function SeletorDeCor({
  cores,
  valor,
  aoMudar,
  rotulo = "Cor",
  formato = "redondo",
  tamanho = "md",
  comPersonalizada = true,
  compacto = false,
  nomeDaCor = (cor) => `Cor ${cor}`,
  rotuloPersonalizada = "Escolher outra cor",
  rotuloCorAtual = "Cor atual",
}: {
  /** As amostras, em qualquer formato CSS ("#1a56db", "rgb(...)", "var(--series-1)"). */
  cores: string[];
  valor: string;
  aoMudar: (cor: string) => void;
  /** Nome do grupo de amostras (e do botão, no modo compacto) para leitores de tela. */
  rotulo?: string;
  formato?: "redondo" | "quadrado";
  tamanho?: "sm" | "md" | "lg";
  /** Mostra o botão arco-íris que abre o seletor nativo (devolve "#rrggbb"). */
  comPersonalizada?: boolean;
  /** Só uma bolinha com a cor atual; a paleta abre num balão ao clicar. */
  compacto?: boolean;
  /** Nome de cada amostra para leitores de tela (padrão: "Cor #1a56db"). */
  nomeDaCor?: (cor: string) => string;
  rotuloPersonalizada?: string;
  /** Prefixo do nome da amostra extra quando a cor atual está fora da paleta. */
  rotuloCorAtual?: string;
}) {
  const visual: Visual = { formato, tamanho };
  const textos: Textos = { rotulo, personalizada: rotuloPersonalizada, corAtual: rotuloCorAtual, nomeDaCor };

  if (!compacto) {
    return (
      <Paleta
        cores={cores}
        valor={valor}
        visual={visual}
        comPersonalizada={comPersonalizada}
        textos={textos}
        aoEscolher={(cor) => aoMudar(cor)}
      />
    );
  }
  return (
    <SeletorCompacto
      cores={cores}
      valor={valor}
      aoMudar={aoMudar}
      visual={visual}
      comPersonalizada={comPersonalizada}
      textos={textos}
    />
  );
}

/** Modo compacto: a bolinha e o balão com a paleta, num portal (não é cortado por contêineres com rolagem). */
function SeletorCompacto({
  cores,
  valor,
  aoMudar,
  visual,
  comPersonalizada,
  textos,
}: {
  cores: string[];
  valor: string;
  aoMudar: (cor: string) => void;
  visual: Visual;
  comPersonalizada: boolean;
  textos: Textos;
}) {
  const id = useId();
  const [alvo, setAlvo] = useState<HTMLElement | null>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const balao = useRef<HTMLDivElement>(null);
  const aberto = alvo !== null;

  function abrir() {
    const elemento = botao.current;
    if (!elemento) return;
    // O portal vai para o ancestral com data-theme (onde moram as variáveis do tema) ou para o <body>
    const tema = elemento.closest<HTMLElement>("[data-theme]");
    setAlvo(tema && tema !== document.documentElement ? tema : document.body);
  }

  const posicionar = useCallback(() => {
    const b = botao.current;
    const p = balao.current;
    if (!b || !p) return;
    const caixa = b.getBoundingClientRect();
    const largura = p.offsetWidth;
    const altura = p.offsetHeight;
    const left = Math.max(MARGEM, Math.min(caixa.left, window.innerWidth - largura - MARGEM));
    const sobe = window.innerHeight - caixa.bottom - DISTANCIA < altura + MARGEM && caixa.top > altura + DISTANCIA + MARGEM;
    p.style.left = `${left}px`;
    p.style.top = `${sobe ? caixa.top - DISTANCIA - altura : caixa.bottom + DISTANCIA}px`;
  }, []);

  // Antes de pintar: posiciona (de novo quando a paleta muda de tamanho) e foca a amostra marcada
  useLayoutEffect(() => {
    if (aberto) posicionar();
  }, [aberto, posicionar, valor]);

  useLayoutEffect(() => {
    if (!aberto) return;
    const p = balao.current;
    const marcada = p?.querySelector<HTMLElement>("[aria-pressed='true']") ?? p?.querySelector<HTMLElement>("button, input");
    marcada?.focus({ preventScroll: true });
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      const t = e.target as Node;
      if (balao.current?.contains(t) || botao.current?.contains(t)) return;
      setAlvo(null);
    };
    // Na captura da janela: o Esc fecha só o balão e não chega a um modal aberto por trás
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setAlvo(null);
      botao.current?.focus();
    };
    const fechar = () => setAlvo(null);
    document.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", esc, true);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", esc, true);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [aberto]);

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={aberto ? id : undefined}
        aria-label={`${textos.rotulo}: ${valor || "nenhuma"}`}
        title={textos.rotulo}
        onClick={() => (aberto ? setAlvo(null) : abrir())}
        className={classesDaAmostra(visual, aberto)}
        style={{ background: valor }}
      />
      {alvo &&
        createPortal(
          <div
            ref={balao}
            id={id}
            role="dialog"
            aria-label={textos.rotulo}
            className="fixed z-50 w-max max-w-[min(16rem,calc(100vw-1rem))] rounded-xl border border-rule bg-page p-3 shadow-flutuante"
          >
            <Paleta
              cores={cores}
              valor={valor}
              visual={visual}
              comPersonalizada={comPersonalizada}
              textos={textos}
              aoEscolher={(cor, origem) => {
                aoMudar(cor);
                // Amostra pronta fecha o balão; no seletor nativo a pessoa ainda está arrastando
                if (origem === "amostra") {
                  setAlvo(null);
                  botao.current?.focus();
                }
              }}
            />
          </div>,
          alvo,
        )}
    </>
  );
}
