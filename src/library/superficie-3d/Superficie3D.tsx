"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export type Superficie3DProps = {
  /**
   * Alturas da superfície: `valores[linha][coluna]`. As colunas correm no eixo X e as linhas no
   * eixo Y. Precisa de pelo menos 2 x 2.
   */
  valores: number[][];
  /** Descrição curta para leitores de tela ("Demanda por hora e dia da semana"). */
  rotulo: string;
  /** Rótulos das colunas (eixo X) e das linhas (eixo Y). Sem eles, usa os índices a partir de 1. */
  rotulosX?: string[];
  rotulosY?: string[];
  /** Nomes dos eixos, mostrados no balão. */
  nomeX?: string;
  nomeY?: string;
  nomeZ?: string;
  formatar?: (valor: number) => string;
  /** Cor da superfície: as partes altas usam ela pura e as baixas, ela clareada. */
  cor?: string;
  /** Rotação inicial em graus (giro em volta do eixo vertical e inclinação da câmera). */
  giro?: number;
  inclinacao?: number;
  /** Mostra a grade, as paredes de fundo e a escala vertical. */
  mostrarEixos?: boolean;
};

const LARGURA = 480;
const ALTURA = 340;
const RAD = Math.PI / 180;

function passoRedondo(bruto: number) {
  const base = 10 ** Math.floor(Math.log10(bruto));
  const f = bruto / base;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * base;
}

/**
 * Superfície 3D em SVG puro, sem WebGL: uma grade de alturas vira uma malha projetada em
 * perspectiva paralela, desenhada de trás para frente e colorida de claro (baixo) a escuro (alto)
 * numa só cor. Arraste ou use as setas para girar; passar o mouse mostra o valor de cada célula.
 */
export function Superficie3D({
  valores,
  rotulo,
  rotulosX,
  rotulosY,
  nomeX = "X",
  nomeY = "Y",
  nomeZ = "Valor",
  formatar = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
  cor = "var(--series-1)",
  giro: giroInicial = -35,
  inclinacao: inclinacaoInicial = 28,
  mostrarEixos = true,
}: Superficie3DProps) {
  const [giro, setGiro] = useState(giroInicial);
  const [inclinacao, setInclinacao] = useState(inclinacaoInicial);
  const [ativa, setAtiva] = useState<{ i: number; j: number; x: number; y: number } | null>(null);
  const arraste = useRef<{ x: number; y: number; giro: number; inclinacao: number } | null>(null);

  const linhas = valores.length;
  const colunas = valores[0]?.length ?? 0;

  const escalaZ = useMemo(() => {
    const todos = valores.flat();
    const minimo = Math.min(0, ...todos);
    const maximo = Math.max(...todos);
    const passo = passoRedondo((maximo - minimo || 1) / 4);
    const topo = Math.ceil(maximo / passo) * passo;
    const base = Math.floor(minimo / passo) * passo;
    const marcas: number[] = [];
    for (let v = base; v <= topo + passo / 2; v += passo) marcas.push(Number(v.toFixed(10)));
    return { base, topo, marcas };
  }, [valores]);

  const desenho = useMemo(() => {
    const g = giro * RAD;
    const e = inclinacao * RAD;
    // Coordenadas normalizadas: x e y de -1 a 1, z de 0 a 1 (multiplicado pela altura da caixa)
    const alturaDaCaixa = 0.9;
    const escala = 128;
    const cx = LARGURA / 2;
    const cy = ALTURA / 2 + 30;
    const projetar = (x: number, y: number, z: number) => {
      const rx = x * Math.cos(g) - y * Math.sin(g);
      const ry = x * Math.sin(g) + y * Math.cos(g);
      const zz = z * alturaDaCaixa;
      // Duas casas: servidor e navegador podem diferir na última casa de seno e cosseno (erro de hidratação)
      return {
        sx: Math.round((cx + rx * escala) * 100) / 100,
        sy: Math.round((cy + (ry * Math.sin(e) - zz * Math.cos(e)) * escala) * 100) / 100,
        // Profundidade: maior = mais perto da câmera
        p: ry * Math.cos(e) + zz * Math.sin(e),
      };
    };
    const nx = (j: number) => (colunas === 1 ? 0 : (j / (colunas - 1)) * 2 - 1);
    const ny = (i: number) => (linhas === 1 ? 0 : (i / (linhas - 1)) * 2 - 1);
    const nz = (v: number) => (escalaZ.topo === escalaZ.base ? 0 : (v - escalaZ.base) / (escalaZ.topo - escalaZ.base));

    // Luz fixa vinda de cima e da esquerda: a inclinação de cada célula escurece um pouco o lado oposto
    const luz = [-0.45, -0.55, 0.7];
    const celulas: { i: number; j: number; d: string; p: number; t: number; sombra: number }[] = [];
    for (let i = 0; i < linhas - 1; i++) {
      for (let j = 0; j < colunas - 1; j++) {
        const cantos = [
          [i, j],
          [i, j + 1],
          [i + 1, j + 1],
          [i + 1, j],
        ].map(([a, b]) => projetar(nx(b), ny(a), nz(valores[a][b])));
        const media = (valores[i][j] + valores[i][j + 1] + valores[i + 1][j + 1] + valores[i + 1][j]) / 4;
        // Normal da célula pelas diagonais, no espaço normalizado (x, y, z * altura da caixa)
        const dx = nx(j + 1) - nx(j);
        const dy = ny(i + 1) - ny(i);
        const dzx = ((nz(valores[i][j + 1]) - nz(valores[i][j]) + nz(valores[i + 1][j + 1]) - nz(valores[i + 1][j])) / 2) * alturaDaCaixa;
        const dzy = ((nz(valores[i + 1][j]) - nz(valores[i][j]) + nz(valores[i + 1][j + 1]) - nz(valores[i][j + 1])) / 2) * alturaDaCaixa;
        const normal = [-dzx * dy, -dzy * dx, dx * dy];
        const tamanho = Math.hypot(...normal) * Math.hypot(...luz);
        const brilho = tamanho === 0 ? 1 : (normal[0] * luz[0] + normal[1] * luz[1] + normal[2] * luz[2]) / tamanho;
        celulas.push({
          i,
          j,
          d: `M${cantos.map((c) => `${c.sx},${c.sy}`).join("L")}Z`,
          p: cantos.reduce((s, c) => s + c.p, 0) / 4,
          t: nz(media),
          // Até 35% de escurecimento nas faces viradas contra a luz
          sombra: Math.round((1 - Math.max(0, brilho)) * 35),
        });
      }
    }
    // Pintor: de trás para frente
    celulas.sort((a, b) => a.p - b.p);

    // Paredes de fundo: em cada eixo, a face cujo centro fica mais longe da câmera
    const fundoX = projetar(-1, 0, 0).p < projetar(1, 0, 0).p ? -1 : 1;
    const fundoY = projetar(0, -1, 0).p < projetar(0, 1, 0).p ? -1 : 1;
    const linhasDaGrade: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const segmento = (a: ReturnType<typeof projetar>, b: ReturnType<typeof projetar>) =>
      linhasDaGrade.push({ x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy });
    const divisoes = 4;
    for (let k = 0; k <= divisoes; k++) {
      const t = (k / divisoes) * 2 - 1;
      // Chão
      segmento(projetar(t, -1, 0), projetar(t, 1, 0));
      segmento(projetar(-1, t, 0), projetar(1, t, 0));
      // Paredes: verticais
      segmento(projetar(t, fundoY, 0), projetar(t, fundoY, 1));
      segmento(projetar(fundoX, t, 0), projetar(fundoX, t, 1));
    }
    // Paredes: horizontais nas marcas da escala vertical
    const marcasZ = escalaZ.marcas.map((v) => {
      const z = nz(v);
      segmento(projetar(-1, fundoY, z), projetar(1, fundoY, z));
      segmento(projetar(fundoX, -1, z), projetar(fundoX, 1, z));
      // Rótulo na aresta vertical da parede que fica mais à esquerda na tela
      const a = projetar(fundoX, -fundoY, z);
      const b = projetar(-fundoX, fundoY, z);
      const ponta = a.sx < b.sx ? a : b;
      return { v, x: ponta.sx - 10, y: ponta.sy - 4 };
    });

    // Rótulos do eixo X na borda da frente do chão, e do eixo Y na borda lateral da frente
    const frenteY = -fundoY;
    const frenteX = -fundoX;
    const passoX = Math.max(1, Math.ceil(colunas / 5));
    const passoY = Math.max(1, Math.ceil(linhas / 5));
    const rotulosEixoX = Array.from({ length: colunas }, (_, j) => j)
      .filter((j) => j % passoX === 0 || j === colunas - 1)
      .map((j) => {
        const p = projetar(nx(j), frenteY * 1.26, 0);
        return { texto: rotulosX?.[j] ?? String(j + 1), x: p.sx, y: p.sy };
      });
    const rotulosEixoY = Array.from({ length: linhas }, (_, i) => i)
      .filter((i) => i % passoY === 0 || i === linhas - 1)
      .map((i) => {
        const p = projetar(frenteX * 1.26, ny(i), 0);
        return { texto: rotulosY?.[i] ?? String(i + 1), x: p.sx, y: p.sy };
      });

    return { celulas, linhasDaGrade, marcasZ, rotulosEixoX, rotulosEixoY };
  }, [valores, linhas, colunas, giro, inclinacao, escalaZ, rotulosX, rotulosY]);

  function aoPressionar(e: PointerEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = { x: e.clientX, y: e.clientY, giro, inclinacao };
    setAtiva(null);
  }

  function aoMover(e: PointerEvent<SVGSVGElement>) {
    if (!arraste.current) return;
    setGiro(arraste.current.giro + (e.clientX - arraste.current.x) * 0.5);
    setInclinacao(Math.min(70, Math.max(8, arraste.current.inclinacao + (e.clientY - arraste.current.y) * 0.3)));
  }

  function aoTeclar(e: KeyboardEvent<SVGSVGElement>) {
    const mapa: Record<string, () => void> = {
      ArrowLeft: () => setGiro((g) => g - 10),
      ArrowRight: () => setGiro((g) => g + 10),
      ArrowUp: () => setInclinacao((i) => Math.min(70, i + 5)),
      ArrowDown: () => setInclinacao((i) => Math.max(8, i - 5)),
    };
    if (!mapa[e.key]) return;
    e.preventDefault();
    mapa[e.key]();
  }

  const celulaAtiva = ativa && {
    media: (valores[ativa.i][ativa.j] + valores[ativa.i][ativa.j + 1] + valores[ativa.i + 1][ativa.j + 1] + valores[ativa.i + 1][ativa.j]) / 4,
  };

  return (
    <figure className="m-0 flex w-full max-w-xl flex-col gap-2">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="block w-full cursor-grab touch-none rounded-sm outline-none select-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent"
          role="img"
          aria-label={`${rotulo}. Superfície de ${nomeZ} por ${nomeX} e ${nomeY}, de ${formatar(Math.min(...valores.flat()))} a ${formatar(
            Math.max(...valores.flat()),
          )}. Use as setas para girar.`}
          tabIndex={0}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={() => (arraste.current = null)}
          onPointerCancel={() => (arraste.current = null)}
          onPointerLeave={() => setAtiva(null)}
          onKeyDown={aoTeclar}
        >
          {mostrarEixos && (
            <g aria-hidden="true">
              {desenho.linhasDaGrade.map((l, k) => (
                <line key={k} {...l} stroke="var(--grid)" strokeWidth={1} />
              ))}
              {desenho.marcasZ.map((m) => (
                <text key={m.v} x={m.x} y={m.y} dy="0.32em" textAnchor="end" className="fill-muted tabular-nums" style={{ fontSize: 10 }}>
                  {formatar(m.v)}
                </text>
              ))}
              {desenho.rotulosEixoX.map((r) => (
                <text key={`x${r.texto}`} x={r.x} y={r.y} dy="0.32em" textAnchor="middle" className="fill-muted" style={{ fontSize: 10 }}>
                  {r.texto}
                </text>
              ))}
              {desenho.rotulosEixoY.map((r) => (
                <text key={`y${r.texto}`} x={r.x} y={r.y} dy="0.32em" textAnchor="middle" className="fill-muted" style={{ fontSize: 10 }}>
                  {r.texto}
                </text>
              ))}
            </g>
          )}
          {desenho.celulas.map((c) => {
            const destacada = ativa?.i === c.i && ativa?.j === c.j;
            return (
              <path
                key={`${c.i}-${c.j}`}
                d={c.d}
                // Sequencial numa cor só: de 30% (baixo) a 100% (alto) misturada com o fundo
                fill={`color-mix(in oklab, color-mix(in oklab, ${cor} ${Math.round(30 + c.t * 70)}%, var(--page)) ${100 - c.sombra}%, black)`}
                stroke={destacada ? "var(--ink)" : "var(--page)"}
                strokeWidth={destacada ? 1.5 : 0.75}
                strokeLinejoin="round"
                onPointerEnter={(e) => {
                  if (arraste.current) return;
                  const caixa = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                  setAtiva({ i: c.i, j: c.j, x: e.clientX - caixa.left, y: e.clientY - caixa.top });
                }}
              />
            );
          })}
        </svg>

        {ativa && celulaAtiva && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 min-w-36 rounded-lg border border-rule bg-page px-3 py-2 text-sm shadow-flutuante"
            style={{ left: ativa.x + 14, top: ativa.y + 14 }}
          >
            <div className="flex justify-between gap-4">
              <span className="text-ink-2">{nomeX}</span>
              <span className="font-medium">
                {rotulosX?.[ativa.j] ?? ativa.j + 1}–{rotulosX?.[ativa.j + 1] ?? ativa.j + 2}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink-2">{nomeY}</span>
              <span className="font-medium">
                {rotulosY?.[ativa.i] ?? ativa.i + 1}–{rotulosY?.[ativa.i + 1] ?? ativa.i + 2}
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-4 border-t border-rule pt-1">
              <span className="text-ink-2">{nomeZ} (média)</span>
              <span className="font-semibold tabular-nums">{formatar(celulaAtiva.media)}</span>
            </div>
          </div>
        )}
      </div>
      <figcaption className="text-xs text-muted">Arraste ou use as setas para girar.</figcaption>
    </figure>
  );
}
