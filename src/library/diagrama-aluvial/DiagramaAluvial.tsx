"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Um grupo de itens que segue o mesmo caminho: uma categoria em cada etapa, na ordem das etapas.
 * Ex.: `{ caminho: ["Plano grátis", "Plano pro", "Ativo"], valor: 120 }`.
 */
export type FluxoAluvial = { caminho: string[]; valor: number };

export type DiagramaAluvialProps = {
  /** Nome de cada coluna (etapa no tempo ou dimensão), da esquerda para a direita. */
  etapas: string[];
  fluxos: FluxoAluvial[];
  /** Descrição curta para leitores de tela ("Migração de planos entre trimestres"). */
  rotulo: string;
  /** Cor de cada categoria pelo nome. Sem isso, as categorias recebem as cores de série na ordem em que aparecem. */
  cores?: Record<string, string>;
  formatar?: (valor: number) => string;
  altura?: number;
  /** Faixas sempre coloridas pela categoria da primeira etapa (padrão: cinza, colorindo só no destaque). */
  colorirFaixas?: boolean;
};

const LARGURA_DA_BARRA = 14;
const ESPACO = 12;
const TOPO = 4;
const BASE = 28;

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

type Bloco = { etapa: number; nome: string; valor: number; y: number; h: number; cor: string };

/**
 * Diagrama aluvial em SVG puro: em cada etapa, as categorias viram barras empilhadas, e cada grupo
 * de itens vira uma faixa que liga as categorias por onde passa. Mostra como uma população se
 * redistribui entre etapas (migração de planos, respostas que mudam, funis com várias dimensões).
 * Passar o mouse numa barra ou faixa colore os caminhos que passam por ali e mostra os valores.
 */
export function DiagramaAluvial({
  etapas,
  fluxos,
  rotulo,
  cores,
  formatar = (n) => n.toLocaleString("pt-BR"),
  altura = 300,
  colorirFaixas = false,
}: DiagramaAluvialProps) {
  const [ref, largura] = useLargura<HTMLDivElement>();
  const [foco, setFoco] = useState<{ etapa: number; nome: string } | { fluxo: number } | null>(null);
  const [ponteiro, setPonteiro] = useState<{ x: number; y: number } | null>(null);

  const desenho = useMemo(() => {
    // Cor por nome de categoria, na ordem em que os nomes aparecem (a 9ª em diante fica neutra)
    const corDe = new Map<string, string>();
    for (const f of fluxos)
      for (const nome of f.caminho)
        if (!corDe.has(nome)) corDe.set(nome, cores?.[nome] ?? (corDe.size < 8 ? `var(--series-${corDe.size + 1})` : "var(--muted)"));

    const total = fluxos.reduce((s, f) => s + f.valor, 0);
    // A etapa com mais categorias define a escala, já que cada uma tem o mesmo total
    const maisCategorias = Math.max(1, ...etapas.map((_, e) => new Set(fluxos.map((f) => f.caminho[e])).size));
    const escala = total === 0 ? 0 : (altura - TOPO - BASE - ESPACO * (maisCategorias - 1)) / total;

    // Rótulos à direita das barras; a última etapa precisa de espaço para eles
    const reservaDireita = 110;
    const xDaEtapa = (e: number) => (etapas.length <= 1 ? 0 : ((largura - reservaDireita - LARGURA_DA_BARRA) * e) / (etapas.length - 1));

    const blocos: Bloco[][] = etapas.map((_, e) => {
      const ordem: string[] = [];
      const soma = new Map<string, number>();
      for (const f of fluxos) {
        const nome = f.caminho[e];
        if (!soma.has(nome)) ordem.push(nome);
        soma.set(nome, (soma.get(nome) ?? 0) + f.valor);
      }
      let y = TOPO;
      return ordem.map((nome) => {
        const h = (soma.get(nome) ?? 0) * escala;
        const bloco = { etapa: e, nome, valor: soma.get(nome) ?? 0, y, h, cor: corDe.get(nome)! };
        y += h + ESPACO;
        return bloco;
      });
    });
    const blocoDe = (e: number, nome: string) => blocos[e].find((b) => b.nome === nome)!;
    const posicao = (e: number, nome: string) => blocos[e].indexOf(blocoDe(e, nome));

    // Entre cada par de etapas, cada fluxo ganha uma fatia da barra de saída e da de chegada.
    // Saídas ordenadas pela categoria de destino, chegadas pela de origem: menos cruzamentos.
    const faixas = etapas.slice(0, -1).flatMap((_, e) => {
      const lista = fluxos.map((f, indice) => ({ f, indice }));
      const y0 = new Map<number, number>();
      const y1 = new Map<number, number>();
      const usadoSaida = new Map<string, number>();
      const usadoChegada = new Map<string, number>();
      [...lista]
        .sort((a, b) => posicao(e + 1, a.f.caminho[e + 1]) - posicao(e + 1, b.f.caminho[e + 1]) || posicao(0, a.f.caminho[0]) - posicao(0, b.f.caminho[0]))
        .forEach(({ f, indice }) => {
          const b = blocoDe(e, f.caminho[e]);
          const u = usadoSaida.get(b.nome) ?? 0;
          y0.set(indice, b.y + u);
          usadoSaida.set(b.nome, u + f.valor * escala);
        });
      [...lista]
        .sort((a, b) => posicao(e, a.f.caminho[e]) - posicao(e, b.f.caminho[e]) || posicao(0, a.f.caminho[0]) - posicao(0, b.f.caminho[0]))
        .forEach(({ f, indice }) => {
          const b = blocoDe(e + 1, f.caminho[e + 1]);
          const u = usadoChegada.get(b.nome) ?? 0;
          y1.set(indice, b.y + u);
          usadoChegada.set(b.nome, u + f.valor * escala);
        });
      return lista.map(({ f, indice }) => {
        const x0 = xDaEtapa(e) + LARGURA_DA_BARRA;
        const x1 = xDaEtapa(e + 1);
        const h = f.valor * escala;
        const a = y0.get(indice)!;
        const b = y1.get(indice)!;
        const m = (x0 + x1) / 2;
        return {
          chave: `${e}-${indice}`,
          indice,
          d: `M${x0},${a} C${m},${a} ${m},${b} ${x1},${b} L${x1},${b + h} C${m},${b + h} ${m},${a + h} ${x0},${a + h} Z`,
          cor: corDe.get(f.caminho[0])!,
        };
      });
    });

    return { blocos, faixas, xDaEtapa, total };
  }, [etapas, fluxos, cores, largura, altura]);

  const passaPor = (indice: number) =>
    foco === null || ("fluxo" in foco ? foco.fluxo === indice : fluxos[indice].caminho[foco.etapa] === foco.nome);

  const dica = (() => {
    if (!foco) return null;
    if ("fluxo" in foco) {
      const f = fluxos[foco.fluxo];
      return { titulo: f.caminho.join(" → "), linhas: [["Itens", formatar(f.valor)]] };
    }
    const bloco = desenho.blocos[foco.etapa].find((b) => b.nome === foco.nome)!;
    const parte = desenho.total ? Math.round((bloco.valor / desenho.total) * 100) : 0;
    return { titulo: `${etapas[foco.etapa]}: ${foco.nome}`, linhas: [["Itens", formatar(bloco.valor)], ["Do total", `${parte}%`]] };
  })();

  return (
    <figure className="m-0 flex w-full flex-col gap-3">
      <div ref={ref} className="relative w-full overflow-hidden">
        <svg
          width={largura}
          height={altura}
          role="img"
          aria-label={`${rotulo}. A tabela a seguir lista cada caminho.`}
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
          {desenho.faixas.map((fx) => {
            const ativa = foco !== null && passaPor(fx.indice);
            return (
              <path
                key={fx.chave}
                d={fx.d}
                fill={ativa || colorirFaixas ? fx.cor : "var(--ink)"}
                fillOpacity={foco === null ? (colorirFaixas ? 0.4 : 0.12) : ativa ? 0.6 : 0.06}
                stroke="var(--page)"
                strokeWidth={0.5}
                className="transition-[fill-opacity] duration-150"
                onPointerEnter={() => setFoco({ fluxo: fx.indice })}
              />
            );
          })}

          {desenho.blocos.flat().map((b) => {
            const x = desenho.xDaEtapa(b.etapa);
            const apagado = foco !== null && !fluxos.some((f, i) => f.caminho[b.etapa] === b.nome && passaPor(i));
            return (
              <g
                key={`${b.etapa}-${b.nome}`}
                opacity={apagado ? 0.35 : 1}
                className="transition-opacity duration-150"
                onPointerEnter={() => setFoco({ etapa: b.etapa, nome: b.nome })}
              >
                <rect x={x - 6} y={b.y} width={LARGURA_DA_BARRA + 12} height={b.h} fill="transparent" />
                <rect x={x} y={b.y} width={LARGURA_DA_BARRA} height={Math.max(1, b.h)} rx={2} fill={b.cor} />
                {b.h >= 14 && (
                  <text
                    x={x + LARGURA_DA_BARRA + 6}
                    y={b.y + b.h / 2}
                    dy="0.32em"
                    className="pointer-events-none fill-ink text-xs font-semibold"
                    style={{ paintOrder: "stroke", stroke: "var(--page)", strokeWidth: 3, strokeLinejoin: "round" }}
                  >
                    {b.nome}
                  </text>
                )}
              </g>
            );
          })}

          {etapas.map((nome, e) => (
            // A primeira etapa alinha o nome pela esquerda, para não sair da área
            <text
              key={nome}
              x={e === 0 ? 0 : desenho.xDaEtapa(e) + LARGURA_DA_BARRA / 2}
              y={altura - 8}
              textAnchor={e === 0 ? "start" : "middle"}
              className="fill-muted text-xs font-semibold"
            >
              {nome}
            </text>
          ))}
        </svg>

        {dica && ponteiro && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 min-w-40 rounded-lg border border-rule bg-page px-3 py-2 text-sm shadow-flutuante"
            style={{
              top: Math.min(ponteiro.y + 14, altura - 80),
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
            {etapas.map((e) => (
              <th key={e} scope="col">
                {e}
              </th>
            ))}
            <th scope="col">Itens</th>
          </tr>
        </thead>
        <tbody>
          {fluxos.map((f, i) => (
            <tr key={i}>
              {f.caminho.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
              <td>{formatar(f.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
