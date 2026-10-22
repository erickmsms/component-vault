"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

/** Um nó (etapa, origem ou destino). Sem `cor`, recebe a próxima cor de série, na ordem da lista. */
export type NoDoSankey = { id: string; rotulo?: string; cor?: string };

/** Um fluxo de `de` para `para`, com a quantidade que passa por ele. */
export type LigacaoDoSankey = { de: string; para: string; valor: number };

export type DiagramaSankeyProps = {
  nos: NoDoSankey[];
  ligacoes: LigacaoDoSankey[];
  /** Descrição curta do diagrama para leitores de tela ("Origem do tráfego do site"). */
  rotulo: string;
  /** Formata os valores dos rótulos, do balão e da tabela. */
  formatar?: (valor: number) => string;
  altura?: number;
  /** Largura das barras dos nós, em px. */
  larguraDoNo?: number;
  /** Espaço vertical entre nós da mesma coluna, em px. */
  espacoEntreNos?: number;
  /** Mostra o valor ao lado do nome de cada nó. */
  mostrarValores?: boolean;
};

type NoCalculado = NoDoSankey & {
  coluna: number;
  valor: number;
  x: number;
  y: number;
  h: number;
  cor: string;
  entrada: number;
  saida: number;
};
type LigacaoCalculada = LigacaoDoSankey & { y0: number; y1: number; h: number; x0: number; x1: number; cor: string };

const MARGEM_Y = 8;

function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(640);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [ref, largura] as const;
}

/** Coluna de cada nó: o caminho mais longo desde uma origem (nós sem entrada ficam na coluna 0). */
function colunas(nos: NoDoSankey[], ligacoes: LigacaoDoSankey[]) {
  const coluna = new Map(nos.map((n) => [n.id, 0]));
  // Relaxa as distâncias; num grafo sem ciclos estabiliza em até n passadas
  for (let i = 0; i < nos.length; i++) {
    let mudou = false;
    for (const l of ligacoes) {
      const proxima = (coluna.get(l.de) ?? 0) + 1;
      if (proxima > (coluna.get(l.para) ?? 0)) {
        coluna.set(l.para, proxima);
        mudou = true;
      }
    }
    if (!mudou) break;
  }
  return coluna;
}

/** Faixa curva entre dois segmentos verticais, como um único caminho preenchido. */
function faixa(l: LigacaoCalculada) {
  const meio = (l.x0 + l.x1) / 2;
  return `M${l.x0},${l.y0} C${meio},${l.y0} ${meio},${l.y1} ${l.x1},${l.y1} L${l.x1},${l.y1 + l.h} C${meio},${l.y1 + l.h} ${meio},${l.y0 + l.h} ${l.x0},${l.y0 + l.h} Z`;
}

/**
 * Diagrama de Sankey em SVG puro: colunas calculadas pelos fluxos, nós com altura proporcional ao
 * volume e faixas da cor da origem. Passar o mouse num nó ou numa faixa destaca o caminho e mostra
 * os valores; uma tabela com todos os fluxos fica disponível para leitores de tela.
 */
export function DiagramaSankey({
  nos,
  ligacoes,
  rotulo,
  formatar = (n) => n.toLocaleString("pt-BR"),
  altura = 320,
  larguraDoNo = 14,
  espacoEntreNos = 16,
  mostrarValores = true,
}: DiagramaSankeyProps) {
  const [ref, largura] = useLargura<HTMLDivElement>();
  const [foco, setFoco] = useState<{ tipo: "no"; id: string } | { tipo: "ligacao"; indice: number } | null>(null);
  const [ponteiro, setPonteiro] = useState<{ x: number; y: number } | null>(null);

  const desenho = useMemo(() => {
    const coluna = colunas(nos, ligacoes);
    const ultimaColuna = Math.max(0, ...coluna.values());
    const entrada = new Map<string, number>();
    const saida = new Map<string, number>();
    for (const l of ligacoes) {
      saida.set(l.de, (saida.get(l.de) ?? 0) + l.valor);
      entrada.set(l.para, (entrada.get(l.para) ?? 0) + l.valor);
    }

    // Rótulos à esquerda na primeira coluna e à direita nas outras: as pontas reservam espaço para eles
    // Largura estimada do texto (text-xs, ~6,5 px por caractere) do maior rótulo de cada ponta
    const larguraDoRotulo = (n: NoDoSankey) =>
      ((n.rotulo ?? n.id).length + (mostrarValores ? formatar(Math.max(entrada.get(n.id) ?? 0, saida.get(n.id) ?? 0)).length + 1 : 0)) * 6.5 + 10;
    const reservaEsquerda = Math.max(8, ...nos.filter((n) => (coluna.get(n.id) ?? 0) === 0).map(larguraDoRotulo));
    const reservaDireita = Math.max(8, ...nos.filter((n) => (coluna.get(n.id) ?? 0) === ultimaColuna).map(larguraDoRotulo));
    const util = Math.max(1, largura - reservaEsquerda - reservaDireita - larguraDoNo);
    const xDaColuna = (c: number) => reservaEsquerda + (ultimaColuna === 0 ? 0 : (util * c) / ultimaColuna);

    const porColuna = Array.from({ length: ultimaColuna + 1 }, () => [] as NoCalculado[]);
    // Cores de série na ordem da lista, sem repetir: a partir da 9ª, cinza neutro
    nos.forEach((n, i) => {
      const c = coluna.get(n.id) ?? 0;
      const valor = Math.max(entrada.get(n.id) ?? 0, saida.get(n.id) ?? 0);
      porColuna[c].push({
        ...n,
        coluna: c,
        valor,
        x: xDaColuna(c),
        y: 0,
        h: 0,
        cor: n.cor ?? (i < 8 ? `var(--series-${i + 1})` : "var(--muted)"),
        entrada: entrada.get(n.id) ?? 0,
        saida: saida.get(n.id) ?? 0,
      });
    });

    // Uma escala para todas as colunas: a coluna mais cheia ocupa a altura toda
    const escala = Math.min(
      ...porColuna.map((col) => {
        const total = col.reduce((s, n) => s + n.valor, 0);
        return total === 0 ? Infinity : (altura - MARGEM_Y * 2 - espacoEntreNos * (col.length - 1)) / total;
      }),
    );
    for (const col of porColuna) {
      const total = col.reduce((s, n) => s + n.valor * escala, 0) + espacoEntreNos * (col.length - 1);
      // Colunas mais vazias ficam centralizadas na altura
      let y = (altura - total) / 2;
      for (const n of col) {
        n.y = y;
        n.h = Math.max(1, n.valor * escala);
        y += n.h + espacoEntreNos;
      }
    }

    const porId = new Map(porColuna.flat().map((n) => [n.id, n]));
    const deslocSaida = new Map<string, number>();
    const deslocEntrada = new Map<string, number>();
    // Saídas ordenadas pela altura do destino, entradas pela altura da origem: as faixas não se cruzam à toa
    const ordenadas = ligacoes
      .map((l, indice) => ({ l, indice }))
      .filter(({ l }) => porId.has(l.de) && porId.has(l.para));
    const calculadas: (LigacaoCalculada & { indice: number })[] = ordenadas.map(({ l, indice }) => ({
      ...l,
      indice,
      x0: porId.get(l.de)!.x + larguraDoNo,
      x1: porId.get(l.para)!.x,
      y0: 0,
      y1: 0,
      h: l.valor * escala,
      cor: porId.get(l.de)!.cor,
    }));
    [...calculadas]
      .sort((a, b) => porId.get(a.para)!.y - porId.get(b.para)!.y)
      .forEach((l) => {
        const d = deslocSaida.get(l.de) ?? 0;
        l.y0 = porId.get(l.de)!.y + d;
        deslocSaida.set(l.de, d + l.h);
      });
    [...calculadas]
      .sort((a, b) => porId.get(a.de)!.y - porId.get(b.de)!.y)
      .forEach((l) => {
        const d = deslocEntrada.get(l.para) ?? 0;
        l.y1 = porId.get(l.para)!.y + d;
        deslocEntrada.set(l.para, d + l.h);
      });

    return { nos: porColuna.flat(), ligacoes: calculadas, porId, ultimaColuna };
  }, [nos, ligacoes, largura, altura, larguraDoNo, espacoEntreNos, mostrarValores, formatar]);

  const nomeDe = (id: string) => desenho.porId.get(id)?.rotulo ?? id;

  // Destaque: a faixa sob o mouse, ou todas as que entram e saem do nó sob o mouse
  const ligada = (l: LigacaoCalculada & { indice: number }) =>
    foco === null || (foco.tipo === "ligacao" ? foco.indice === l.indice : l.de === foco.id || l.para === foco.id);
  const noLigado = (n: NoCalculado) =>
    foco === null ||
    (foco.tipo === "no"
      ? n.id === foco.id || ligacoes.some((l) => (l.de === foco.id && l.para === n.id) || (l.para === foco.id && l.de === n.id))
      : ligacoes[foco.indice].de === n.id || ligacoes[foco.indice].para === n.id);

  const dica = (() => {
    if (!foco) return null;
    if (foco.tipo === "ligacao") {
      const l = ligacoes[foco.indice];
      return { titulo: `${nomeDe(l.de)} → ${nomeDe(l.para)}`, linhas: [["Fluxo", formatar(l.valor)]] };
    }
    const n = desenho.porId.get(foco.id)!;
    const linhas: string[][] = [];
    if (n.entrada) linhas.push(["Entra", formatar(n.entrada)]);
    if (n.saida) linhas.push(["Sai", formatar(n.saida)]);
    return { titulo: nomeDe(n.id), linhas };
  })();

  return (
    <figure className="m-0 flex w-full flex-col gap-3">
      <div ref={ref} className="relative w-full overflow-hidden">
        <svg
          width={largura}
          height={altura}
          role="img"
          aria-label={`${rotulo}. A tabela a seguir lista todos os fluxos.`}
          className="block select-none"
          onPointerMove={(e) => {
            const caixa = e.currentTarget.getBoundingClientRect();
            setPonteiro({ x: e.clientX - caixa.left, y: e.clientY - caixa.top });
          }}
          onPointerLeave={() => {
            setFoco(null);
            setPonteiro(null);
          }}
        >
          {desenho.ligacoes.map((l) => (
            <path
              key={l.indice}
              d={faixa(l)}
              fill={l.cor}
              fillOpacity={foco === null ? 0.42 : ligada(l) ? 0.72 : 0.1}
              className="cursor-default transition-[fill-opacity] duration-150"
              onPointerEnter={() => setFoco({ tipo: "ligacao", indice: l.indice })}
            />
          ))}
          {desenho.nos.map((n) => {
            const aEsquerda = n.coluna === 0;
            return (
              <g
                key={n.id}
                opacity={noLigado(n) ? 1 : 0.35}
                className="transition-opacity duration-150"
                onPointerEnter={() => setFoco({ tipo: "no", id: n.id })}
              >
                {/* Área de toque maior que a barra */}
                <rect x={n.x - 6} y={n.y} width={larguraDoNo + 12} height={n.h} fill="transparent" />
                <rect x={n.x} y={n.y} width={larguraDoNo} height={n.h} rx={2} fill={n.cor} stroke="var(--page)" strokeWidth={1} />
                <text
                  x={aEsquerda ? n.x - 6 : n.x + larguraDoNo + 6}
                  y={n.y + n.h / 2}
                  dy="0.32em"
                  textAnchor={aEsquerda ? "end" : "start"}
                  className="pointer-events-none fill-ink text-xs font-semibold"
                  style={{ paintOrder: "stroke", stroke: "var(--page)", strokeWidth: 3, strokeLinejoin: "round" }}
                >
                  {n.rotulo ?? n.id}
                  {mostrarValores && <tspan className="fill-muted font-normal"> {formatar(n.valor)}</tspan>}
                </text>
              </g>
            );
          })}
        </svg>

        {dica && ponteiro && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 min-w-36 rounded-lg border border-rule bg-page px-3 py-2 text-sm shadow-flutuante"
            style={{
              top: Math.min(ponteiro.y + 14, altura - 70),
              ...(ponteiro.x > largura * 0.6 ? { right: largura - ponteiro.x + 14 } : { left: ponteiro.x + 14 }),
            }}
          >
            <div className="mb-1 font-semibold">{dica.titulo}</div>
            {dica.linhas.map(([nome, valor]) => (
              <div key={nome} className="flex justify-between gap-4">
                <span className="text-ink-2">{nome}</span>
                <span className="font-medium tabular-nums">{valor}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>{rotulo}</caption>
        <thead>
          <tr>
            <th scope="col">De</th>
            <th scope="col">Para</th>
            <th scope="col">Valor</th>
          </tr>
        </thead>
        <tbody>
          {ligacoes.map((l, i) => (
            <tr key={i}>
              <td>{nomeDe(l.de)}</td>
              <td>{nomeDe(l.para)}</td>
              <td>{formatar(l.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
