"use client";

import { useEffect, useRef, useState } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/**
 * Uma peça do conjunto, montada ao longo do eixo na ordem da lista (a primeira fica no fundo).
 * Medidas relativas: `raio` de 0 a 1 (1 = a peça mais larga) e `comprimento` na mesma escala.
 */
export type PecaExplodida = {
  /** Letra ou número da chamada ("A", "1"). Vazio: a peça não ganha chamada nem entra na legenda. */
  marcador: string;
  nome: string;
  descricao?: string;
  /** disco: cilindro curto · anel: disco com furo · eixo: cilindro fino e longo · cilindro: corpo com furo raso na frente. */
  forma: "disco" | "anel" | "eixo" | "cilindro";
  raio: number;
  comprimento: number;
  cor?: string;
  /** Raio do furo do anel ou do cilindro, em fração do raio da peça. */
  furo?: number;
  /** Fica grudada na peça anterior mesmo explodida (um eixo que faz parte do cubo, por exemplo). */
  presaAnterior?: boolean;
};

export type VistaExplodidaProps = {
  pecas: PecaExplodida[];
  /** Descrição curta para leitores de tela ("Conjunto da roda com eixo e espaçadores"). */
  rotulo: string;
  /**
   * Separação entre as peças, de 0 (montado) a 1 (explodido). Sem valor, anima de montado a
   * explodido quando aparece na tela.
   */
  separacao?: number;
  /** Ângulo do eixo de montagem, em graus a partir da horizontal (positivo desce para a direita). */
  angulo?: number;
  /** Mostra a lista de peças abaixo do desenho. */
  mostrarLegenda?: boolean;
};

const LARGURA = 480;
const ALTURA = 300;
const ACHATAMENTO = 0.42;
const FOLGA = 0.6;

type Vetor = [number, number];
// Duas casas: servidor e navegador podem diferir na última casa de seno e cosseno (erro de hidratação)
const arredondar = (n: number) => Math.round(n * 100) / 100;
const somar = (a: Vetor, b: Vetor, k = 1): Vetor => [arredondar(a[0] + b[0] * k), arredondar(a[1] + b[1] * k)];

/** Elipse da face de uma peça: eixo maior perpendicular ao eixo de montagem. */
function elipse(c: Vetor, r: number, u: Vetor, n: Vetor) {
  const pontos = Array.from({ length: 33 }, (_, k) => {
    const t = (k / 32) * Math.PI * 2;
    return somar(
      somar(c, n, r * Math.cos(t)),
      u,
      r * ACHATAMENTO * Math.sin(t),
    );
  });
  return `M${pontos.map((p) => p.join(",")).join("L")}Z`;
}

/**
 * Vista explodida de um conjunto de peças cilíndricas, em SVG puro: cada peça é desenhada em
 * isométrico ao longo do eixo de montagem, com chamadas de letra e linhas guia. A separação anima
 * de montado a explodido ao entrar na tela (ou fica fixa com `separacao`). Passar o mouse numa peça
 * ou na legenda destaca ela e mostra o nome e a descrição.
 */
export function VistaExplodida({
  pecas,
  rotulo,
  separacao,
  angulo = 28,
  mostrarLegenda = true,
}: VistaExplodidaProps) {
  const ref = useRef<SVGSVGElement>(null);
  const semMovimento = useSemMovimento();
  const visivel = useEmTela(ref);
  const [progresso, setProgresso] = useState(0);
  const [ativa, setAtiva] = useState<number | null>(null);

  // Sem `separacao`, anima de 0 a 1 uma vez, quando aparece
  useEffect(() => {
    if (separacao !== undefined || !visivel || semMovimento) return;
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / 1100);
      setProgresso(1 - (1 - t) ** 3);
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [visivel, semMovimento, separacao]);

  const s = separacao ?? (semMovimento ? 1 : progresso);
  const a = (angulo * Math.PI) / 180;
  const u: Vetor = [Math.cos(a), Math.sin(a)];
  const n: Vetor = [-Math.sin(a), Math.cos(a)];

  // Comprimento total no eixo, com as folgas da explosão, para encaixar no quadro
  const raioMax = Math.max(...pecas.map((p) => p.raio), 0.01);
  const folgas = pecas.slice(1).filter((p) => !p.presaAnterior).length;
  const total =
    pecas.reduce((t, p) => t + p.comprimento, 0) + FOLGA * s * folgas;
  const alcanceX = total * Math.abs(u[0]) + 2 * raioMax * Math.abs(n[0]);
  const alcanceY = total * Math.abs(u[1]) + 2 * raioMax * Math.abs(n[1]);
  const escala = Math.min((LARGURA - 120) / alcanceX, (ALTURA - 90) / alcanceY);
  const inicio: Vetor = [
    LARGURA / 2 - (u[0] * total * escala) / 2,
    ALTURA / 2 - (u[1] * total * escala) / 2,
  ];

  // Início de cada peça no eixo: soma dos comprimentos anteriores e das folgas entre peças soltas
  const inicios = pecas.reduce<number[]>((lista, p, i) => {
    if (i === 0) return [0];
    const anterior = lista[i - 1] + pecas[i - 1].comprimento + (p.presaAnterior ? 0 : FOLGA * s);
    return [...lista, anterior];
  }, []);
  const desenhos = pecas.map((p, i) => {
    const c0 = somar(inicio, u, inicios[i] * escala);
    const c1 = somar(inicio, u, (inicios[i] + p.comprimento) * escala);
    const r = p.raio * escala;
    const cor = p.cor ?? "var(--series-1)";
    // Chamadas alternam acima e abaixo do eixo, a partir da borda da peça
    const lado = i % 2 === 0 ? 1 : -1;
    const meio = somar(c0, u, (p.comprimento * escala) / 2);
    const borda = somar(meio, n, r * lado);
    const ponta = somar(borda, n, (raioMax * escala - r + 34) * lado);
    return { p, i, c0, c1, r, cor, borda, ponta, lado };
  });

  const sombra = (cor: string, k: number) =>
    `color-mix(in oklab, ${cor} ${100 - k}%, black)`;

  return (
    <figure className="m-0 flex w-full max-w-xl flex-col gap-3">
      <div className="relative">
        <svg
          ref={ref}
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="block w-full select-none"
          role="img"
          aria-label={`${rotulo}. ${pecas.map((p) => `${p.marcador}: ${p.nome}`).join(". ")}.`}
        >
          {/* Linha do eixo de montagem */}
          <line
            x1={somar(inicio, u, -0.3 * escala)[0]}
            y1={somar(inicio, u, -0.3 * escala)[1]}
            x2={somar(inicio, u, (total + 0.3) * escala)[0]}
            y2={somar(inicio, u, (total + 0.3) * escala)[1]}
            stroke="var(--axis)"
            strokeWidth={1}
            strokeDasharray="6 4"
            opacity={s}
          />

          {desenhos.map(({ p, i, c0, c1, r, cor }) => {
            const apagada = ativa !== null && ativa !== i;
            const furo =
              p.forma === "anel"
                ? (p.furo ?? 0.6)
                : p.forma === "cilindro"
                  ? (p.furo ?? 0.35)
                  : 0;
            const corpo = [
              somar(c0, n, r),
              somar(c1, n, r),
              somar(c1, n, -r),
              somar(c0, n, -r),
            ];
            return (
              <g
                key={i}
                opacity={apagada ? 0.3 : 1}
                className="transition-opacity duration-150"
                onPointerEnter={() => setAtiva(i)}
                onPointerLeave={() => setAtiva(null)}
              >
                {/* Fundo, corpo e frente: a face da frente fica virada para baixo e para a direita */}
                <path d={elipse(c0, r, u, n)} fill={sombra(cor, 30)} />
                <path
                  d={`M${corpo.map((q) => q.join(",")).join("L")}Z`}
                  fill={sombra(cor, 18)}
                />
                <path
                  d={elipse(c1, r, u, n)}
                  fill={cor}
                  stroke={sombra(cor, 30)}
                  strokeWidth={0.75}
                />
                {furo > 0 && (
                  <>
                    <path
                      d={elipse(c1, r * furo, u, n)}
                      fill={sombra(cor, 42)}
                    />
                    {/* Brilho na borda interna do furo, do lado oposto à luz */}
                    <path
                      d={elipse(
                        somar(c1, u, r * furo * 0.25),
                        r * furo * 0.82,
                        u,
                        n,
                      )}
                      fill={sombra(cor, 55)}
                      opacity={p.forma === "anel" ? 0 : 0.6}
                    />
                  </>
                )}
                {p.forma === "disco" && (
                  <path
                    d={elipse(c1, r * 0.55, u, n)}
                    fill="none"
                    stroke={sombra(cor, 18)}
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}

          {desenhos
            .filter(({ p }) => p.marcador)
            .map(({ p, i, borda, ponta, lado }) => (
              <g
                key={`chamada-${i}`}
                opacity={0.4 + 0.6 * s}
                pointerEvents="none"
              >
                <line
                  x1={borda[0]}
                  y1={borda[1]}
                  x2={ponta[0]}
                  y2={ponta[1]}
                  stroke="var(--axis)"
                  strokeWidth={1}
                />
                <circle cx={borda[0]} cy={borda[1]} r={2} fill="var(--ink)" />
                <text
                  x={ponta[0]}
                  y={ponta[1] + (lado > 0 ? 12 : -6)}
                  textAnchor="middle"
                  className={`text-xs font-bold ${ativa === i ? "fill-accent" : "fill-ink"}`}
                >
                  {p.marcador}
                </text>
              </g>
            ))}
        </svg>

        {ativa !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 left-2 z-10 max-w-60 rounded-lg border border-rule bg-page px-3 py-2 text-sm shadow-flutuante"
          >
            <div className="font-semibold">
              {pecas[ativa].marcador} · {pecas[ativa].nome}
            </div>
            {pecas[ativa].descricao && (
              <div className="mt-0.5 text-ink-2">{pecas[ativa].descricao}</div>
            )}
          </div>
        )}
      </div>

      {mostrarLegenda && (
        <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {pecas.map(
            (p, i) =>
              p.marcador && (
                <li
                  key={i}
                  className={`flex items-baseline gap-2 rounded-sm transition-colors ${ativa === i ? "text-ink" : "text-ink-2"}`}
                  onPointerEnter={() => setAtiva(i)}
                  onPointerLeave={() => setAtiva(null)}
                >
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ink/10 text-xs font-bold text-ink">
                    {p.marcador}
                  </span>
                  <span>
                    <span className="font-medium text-ink">{p.nome}</span>
                    {p.descricao && <span> · {p.descricao}</span>}
                  </span>
                </li>
              ),
          )}
        </ol>
      )}
    </figure>
  );
}
