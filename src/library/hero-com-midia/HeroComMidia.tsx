"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";
import estilos from "./HeroComMidia.module.css";

/** Trecho do título. Com `enfase`, o trecho sai em itálico (o realce da frase). */
export type TrechoDoTitulo = { texto: string; enfase?: boolean };

/** Mídia de fundo do hero. */
export type MidiaDoHero =
  | {
      tipo: "video";
      /** Endereço do vídeo: toca mudo, em loop e sem controles nativos. */
      src: string;
      /** Imagem mostrada enquanto o vídeo carrega. */
      poster?: string;
    }
  | {
      tipo: "imagem";
      src: string;
      /** Texto alternativo. Vazio (padrão) quando a imagem é só decorativa. */
      alt?: string;
    };

export type TextosDoHero = { pausarVideo: string; reproduzirVideo: string };

const TEXTOS_PADRAO: TextosDoHero = {
  pausarVideo: "Pausar vídeo de fundo",
  reproduzirVideo: "Reproduzir vídeo de fundo",
};

// O véu acompanha o texto: mais denso do lado dele. No celular, onde o texto
// ocupa a largura toda, é uniforme.
const VEU = {
  esquerda: "bg-page/75 sm:bg-transparent sm:bg-linear-to-r sm:from-page sm:via-page/65 sm:to-page/30",
  centro: "bg-page/75 sm:bg-transparent sm:bg-radial sm:from-page sm:via-page/80 sm:to-page/50",
} as const;

/**
 * Esquema de cores fixo sobre a mídia. Os tokens do tema são `light-dark()`,
 * então `color-scheme: dark` faz `bg-page` e `text-ink` valerem os valores do
 * modo escuro aqui dentro, nos dois modos: véu escuro e texto claro sem cor
 * fixa, ainda com as cores do tema. "claro" faz o inverso, para fundos claros.
 */
const ESQUEMA = { escuro: "scheme-dark", claro: "scheme-light" } as const;

/**
 * Abertura de página sobre vídeo, imagem ou um fundo qualquer. A mídia se
 * revela por quatro faixas da cor da página recuando para as bordas, com um
 * leve zoom de afastamento; o título entra palavra por palavra, subindo na
 * diagonal, e depois o subtítulo e as ações. Tudo em CSS, para o primeiro
 * quadro já sair certo antes da hidratação. Com "reduzir movimento" (do sistema
 * ou de um ProvedorDeMovimento) aparece direto no estado final.
 */
export function HeroComMidia({
  chapeu,
  titulo,
  subtitulo,
  acoes,
  midia,
  fundo,
  veu = 0.7,
  esquema = "escuro",
  altura = "tela",
  alinhamento = "esquerda",
  corDaCortina,
  inicioDoTexto = 500,
  intervaloEntrePalavras = 55,
  duracaoDaAbertura = 1000,
  duracaoDoTexto = 850,
  textos: textosParciais,
  className = "",
}: {
  /** Linha curta acima do título: categoria, contexto, chamada. */
  chapeu?: string;
  /**
   * Texto do título, ou trechos `{ texto, enfase }` quando parte dele deve sair
   * em itálico. O título entra palavra por palavra.
   */
  titulo: string | TrechoDoTitulo[];
  subtitulo?: ReactNode;
  /** Botões e links abaixo do subtítulo. Ficam no esquema de cores do hero (veja `esquema`). */
  acoes?: ReactNode;
  /** Vídeo ou imagem de fundo, cobrindo a área toda. Tem prioridade sobre `fundo`. */
  midia?: MidiaDoHero;
  /** Fundo próprio (gradiente, ilustração, canvas...). Deve ocupar a área toda (`absolute inset-0` ou `size-full`). */
  fundo?: ReactNode;
  /** Densidade do véu sobre a mídia, de 0 (sem véu) a 1. Garante a leitura do texto. */
  veu?: number;
  /**
   * Esquema de cores do véu e do texto: "escuro" (véu escuro, texto claro, nos
   * dois modos) ou "claro" (véu claro, texto escuro), para fundos claros.
   */
  esquema?: keyof typeof ESQUEMA;
  /** "tela" ocupa a altura da janela; "auto" segue o conteúdo, com respiro. */
  altura?: "tela" | "auto";
  alinhamento?: "esquerda" | "centro";
  /**
   * Cor das faixas da abertura (qualquer cor CSS). O padrão é a cor da página
   * (`var(--page)`), para a mídia se abrir a partir dela; mude se o hero estiver
   * sobre outro fundo.
   */
  corDaCortina?: string;
  /** Quando (ms) o texto começa a entrar, contado da abertura da página. */
  inicioDoTexto?: number;
  /** Espera (ms) entre uma palavra do título e a seguinte. */
  intervaloEntrePalavras?: number;
  /** Duração (ms) da abertura das faixas; o zoom da mídia dura 1,8× isso. */
  duracaoDaAbertura?: number;
  /** Duração (ms) da subida de cada peça de texto. */
  duracaoDoTexto?: number;
  /** Rótulos do botão que pausa o vídeo de fundo. */
  textos?: Partial<TextosDoHero>;
  /** Classes extras no <section> (cantos arredondados, margem...). */
  className?: string;
}) {
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  const semMovimento = useSemMovimento();
  const video = useRef<HTMLVideoElement>(null);
  // Escolha de quem clicou no botão; sem ela, o vídeo fica parado só com "reduzir movimento".
  const [escolha, setEscolha] = useState<"tocar" | "pausar" | null>(null);
  const videoParado = escolha ? escolha === "pausar" : semMovimento;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (videoParado) el.pause();
    // O navegador pode bloquear o play automático: o vídeo só fica no pôster.
    else el.play().catch(() => {});
  }, [videoParado, midia?.src]);

  const trechos = typeof titulo === "string" ? [{ texto: titulo }] : titulo;
  const palavras = trechos.flatMap(({ texto, enfase }) =>
    texto
      .split(/\s+/)
      .filter(Boolean)
      .map((palavra) => ({ palavra, enfase: Boolean(enfase) })),
  );

  // Compasso da entrada: chapéu, palavras do título, subtítulo, ações.
  const inicioDoTitulo = inicioDoTexto + (chapeu ? 80 : 0);
  const fimDoTitulo = inicioDoTitulo + palavras.length * intervaloEntrePalavras;
  const subir = (distancia: number, atraso: number) =>
    ({ "--sobe": `${distancia}px`, animationDelay: `${atraso}ms` }) as CSSProperties;

  const centro = alinhamento === "centro";
  const cortina = { background: corDaCortina ?? "var(--page)" };

  return (
    <section
      className={`relative isolate flex w-full flex-col overflow-hidden ${altura === "tela" ? "min-h-svh" : ""} ${
        semMovimento ? estilos.parado : ""
      } ${className}`}
      style={{ "--hero-abertura": `${duracaoDaAbertura}ms`, "--hero-texto": `${duracaoDoTexto}ms` } as CSSProperties}
    >
      {/* Fundo: mídia e véu, no esquema fixo (o bg-page é o que aparece enquanto a mídia carrega). */}
      <div className={`absolute inset-0 bg-page ${ESQUEMA[esquema]}`}>
        <div className={`absolute inset-0 ${estilos.midia}`}>
          {midia?.tipo === "video" ? (
            <video
              ref={video}
              className="absolute inset-0 size-full object-cover"
              src={midia.src}
              poster={midia.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          ) : midia?.tipo === "imagem" ? (
            // eslint-disable-next-line @next/next/no-img-element -- a biblioteca não depende de next/image
            <img
              className="absolute inset-0 size-full object-cover"
              src={midia.src}
              alt={midia.alt ?? ""}
              fetchPriority="high"
            />
          ) : (
            fundo
          )}
        </div>
        {veu > 0 && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${VEU[alinhamento]}`}
            style={{ opacity: Math.min(1, veu) }}
          />
        )}
      </div>

      {/* Abertura: as quatro faixas partem cobrindo tudo menos uma janela central
          e recuam cada uma para a sua borda. Ficam fora do esquema fixo para
          terem a cor da página de verdade. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-x-0 top-0 h-[27%] origin-top ${estilos.faixa} ${estilos.faixaVertical}`}
          style={cortina}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-[27%] origin-bottom ${estilos.faixa} ${estilos.faixaVertical}`}
          style={cortina}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[21%] origin-left ${estilos.faixa} ${estilos.faixaHorizontal}`}
          style={cortina}
        />
        <div
          className={`absolute inset-y-0 right-0 w-[21%] origin-right ${estilos.faixa} ${estilos.faixaHorizontal}`}
          style={cortina}
        />
      </div>

      <div
        className={`relative z-10 flex w-full flex-1 flex-col text-ink ${ESQUEMA[esquema]} ${
          altura === "tela" ? "pt-32 pb-24" : "py-24 sm:py-32"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-[100rem] flex-1 flex-col justify-center px-6 sm:px-10 lg:px-16 ${
            centro ? "items-center text-center" : "items-start"
          }`}
        >
          <div className="max-w-3xl">
            {chapeu && (
              <p
                className={`${estilos.sobe} mb-5 text-xs font-semibold tracking-[0.14em] text-ink/80 uppercase`}
                style={subir(20, inicioDoTexto)}
              >
                {chapeu}
              </p>
            )}

            <h1 className="font-display text-5xl leading-[1.05] font-bold tracking-[-0.01em] sm:text-6xl lg:text-7xl">
              {palavras.map(({ palavra, enfase }, i) => (
                <Fragment key={`${i}-${palavra}`}>
                  <span
                    className={`${estilos.sobe} inline-block ${enfase ? "italic" : ""}`}
                    style={subir(40, inicioDoTitulo + i * intervaloEntrePalavras)}
                  >
                    {palavra}
                  </span>{" "}
                </Fragment>
              ))}
            </h1>

            {subtitulo && (
              <p
                className={`${estilos.sobe} mt-6 max-w-2xl text-lg leading-relaxed text-ink/85 sm:text-xl ${
                  centro ? "mx-auto" : ""
                }`}
                style={subir(20, fimDoTitulo)}
              >
                {subtitulo}
              </p>
            )}

            {acoes && (
              <div
                className={`${estilos.sobe} mt-10 flex flex-wrap gap-3 ${centro ? "justify-center" : ""}`}
                style={subir(20, fimDoTitulo + 100)}
              >
                {acoes}
              </div>
            )}
          </div>
        </div>

        {/* Vídeo que toca sozinho por mais de 5 s precisa de um jeito de parar (WCAG 2.2.2). */}
        {midia?.tipo === "video" && (
          <button
            type="button"
            onClick={() => setEscolha(videoParado ? "tocar" : "pausar")}
            aria-label={videoParado ? textos.reproduzirVideo : textos.pausarVideo}
            className={`${estilos.sobe} absolute right-4 bottom-4 grid size-10 cursor-pointer place-items-center rounded-full bg-page/60 text-ink outline-accent backdrop-blur-sm transition-colors hover:bg-page/80 focus-visible:outline-2 focus-visible:outline-offset-2 sm:right-6 sm:bottom-6`}
            style={subir(0, fimDoTitulo + 200)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
              {videoParado ? <path d="M8 5.5v13l10.5-6.5L8 5.5Z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
