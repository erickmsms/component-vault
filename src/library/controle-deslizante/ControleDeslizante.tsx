"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const CORES = {
  destaque: { preenchimento: "bg-accent", borda: "border-accent" },
  sucesso: { preenchimento: "bg-success", borda: "border-success" },
  alerta: { preenchimento: "bg-warning", borda: "border-warning" },
  perigo: { preenchimento: "bg-critical", borda: "border-critical" },
} as const;

/**
 * Medidas em unidades de --spacing. Na "linha", o trilho é fino e o polegar, um círculo maior que ele.
 * Na "capsula", o polegar fica dentro do trilho, a uma folga de 1 unidade da borda.
 */
const TAMANHOS = {
  sm: { trilho: 1, polegar: 4, capsula: 6 },
  md: { trilho: 1.5, polegar: 5, capsula: 8 },
  lg: { trilho: 2, polegar: 6, capsula: 10 },
} as const;

/**
 * Arredondamento concêntrico da cápsula, de dentro para fora: o polegar e o preenchimento usam o
 * raio do tema limitado à metade da altura deles, e o trilho é esse raio mais a folga de 1 unidade
 * (só quando o tema tem arredondamento: com raio 0, fica tudo reto).
 * Classes por extenso para o Tailwind encontrá-las.
 */
const RAIOS_DA_CAPSULA = {
  sm: {
    dentro: "rounded-[min(var(--radius-lg),var(--spacing)*2)]",
    fora: "rounded-[calc(min(var(--radius-lg),var(--spacing)*2)_+_min(var(--radius-lg)*100,var(--spacing)))]",
  },
  md: {
    dentro: "rounded-[min(var(--radius-lg),var(--spacing)*3)]",
    fora: "rounded-[calc(min(var(--radius-lg),var(--spacing)*3)_+_min(var(--radius-lg)*100,var(--spacing)))]",
  },
  lg: {
    dentro: "rounded-[min(var(--radius-lg),var(--spacing)*4)]",
    fora: "rounded-[calc(min(var(--radius-lg),var(--spacing)*4)_+_min(var(--radius-lg)*100,var(--spacing)))]",
  },
} as const;

export type CorDoControle = keyof typeof CORES;
export type TamanhoDoControle = keyof typeof TAMANHOS;
export type ValorDoControle = number | [number, number];

/** Uma marca no trilho, com rótulo opcional embaixo (ou ao lado, na vertical). */
export type MarcaDoControle = { valor: number; rotulo?: string };

export type ControleDeslizanteProps = {
  /** Rótulo visível acima do trilho; também nomeia o controle para leitores de tela. */
  rotulo?: string;
  /** Valor controlado: um número ou `[início, fim]` para um intervalo. Use junto com `aoMudar`. */
  valor?: ValorDoControle;
  /** Valor inicial quando não é controlado. Um par vira intervalo com dois polegares. */
  valorPadrao?: ValorDoControle;
  /** Chamado a cada mudança, inclusive durante o arraste. */
  aoMudar?: (valor: ValorDoControle) => void;
  /** Chamado ao soltar o polegar ou ao terminar uma mudança pelo teclado (bom para salvar ou buscar). */
  aoSoltar?: (valor: ValorDoControle) => void;
  min?: number;
  max?: number;
  passo?: number;
  /** No intervalo, a menor distância permitida entre os dois polegares. */
  distanciaMinima?: number;
  /** Formata os valores mostrados e lidos por leitores de tela ("R$ 120", "40%"). */
  formatar?: (valor: number) => string;
  /** Mostra o valor atual ao lado do rótulo. */
  mostrarValor?: boolean;
  /** Marcas no trilho. Com rótulo, o texto aparece abaixo; clicar nele leva o polegar até ali. */
  marcas?: MarcaDoControle[];
  /** O valor só para nas marcas (e as setas pulam de uma para a próxima), como em opções fixas. */
  soNasMarcas?: boolean;
  /** "linha": trilho fino e polegar redondo. "capsula": trilho grosso com o polegar por dentro. */
  aparencia?: "linha" | "capsula";
  tamanho?: TamanhoDoControle;
  cor?: CorDoControle;
  orientacao?: "horizontal" | "vertical";
  desativado?: boolean;
  /** Nomes dos polegares de um intervalo para leitores de tela. */
  rotulosDosPolegares?: [string, string];
  /** Nome do campo: cria `<input type="hidden">` para enviar com formulários (um por polegar). */
  nome?: string;
  /** Classes extras no contêiner (na vertical, defina a altura aqui, como `h-64`). */
  className?: string;
};

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Arredonda ao passo mais próximo, sem resíduos de ponto flutuante (0,1 + 0,2). */
function noPasso(n: number, min: number, passo: number) {
  const casas = (String(passo).split(".")[1] ?? "").length;
  return Number((Math.round((n - min) / passo) * passo + min).toFixed(casas));
}

/**
 * Controle deslizante de um valor ou de um intervalo, sem dependências: arraste com mouse ou toque,
 * clique no trilho, setas, Page Up/Down e Home/End. Duas aparências (linha e cápsula com
 * arredondamento concêntrico), três tamanhos, quatro cores, marcas com rótulo e orientação vertical.
 */
export function ControleDeslizante({
  rotulo,
  valor: valorControlado,
  valorPadrao = 50,
  aoMudar,
  aoSoltar,
  min = 0,
  max = 100,
  passo = 1,
  distanciaMinima = 0,
  formatar = (n) => String(n),
  mostrarValor = true,
  marcas,
  soNasMarcas = false,
  aparencia = "linha",
  tamanho = "md",
  cor = "destaque",
  orientacao = "horizontal",
  desativado = false,
  rotulosDosPolegares = ["Mínimo", "Máximo"],
  nome,
  className = "",
}: ControleDeslizanteProps) {
  const [interno, setInterno] = useState<ValorDoControle>(valorPadrao);
  const atual = valorControlado ?? interno;
  const intervalo = Array.isArray(atual);
  const valores = intervalo ? atual : [atual];

  const trilho = useRef<HTMLDivElement>(null);
  const polegares = useRef<(HTMLDivElement | null)[]>([]);
  // Durante o arraste: qual polegar e o último valor (para o aoSoltar não ler um estado antigo)
  const arraste = useRef<{ indice: number; ultimo: ValorDoControle } | null>(null);
  const idRotulo = useId();

  const vertical = orientacao === "vertical";
  const medidas = TAMANHOS[tamanho];
  const capsula = aparencia === "capsula";
  // Tamanho do polegar em unidades: na cápsula, a altura interna do trilho
  const polegar = capsula ? medidas.capsula - 2 : medidas.polegar;
  const espessura = capsula ? medidas.capsula : medidas.trilho;
  const cores = CORES[cor];
  const raios = RAIOS_DA_CAPSULA[tamanho];

  const fracao = (n: number) => (max === min ? 0 : (limitar(n, min, max) - min) / (max - min));
  /** Posição ao longo do trilho: o polegar inteiro cabe dentro, de ponta a ponta. */
  const posicao = (n: number) => `calc(${fracao(n)} * (100% - var(--spacing) * ${polegar}))`;

  function mudar(indice: number, bruto: number) {
    let n = noPasso(limitar(bruto, min, max), min, passo);
    if (soNasMarcas && marcas?.length) {
      // A marca mais perto do valor pedido
      n = marcas.reduce((perto, m) => (Math.abs(m.valor - bruto) < Math.abs(perto - bruto) ? m.valor : perto), marcas[0].valor);
    }
    let proximo: ValorDoControle;
    if (intervalo) {
      const [a, b] = valores;
      // Os polegares não se cruzam: cada um para a `distanciaMinima` do outro
      if (indice === 0) n = Math.min(n, b - distanciaMinima);
      else n = Math.max(n, a + distanciaMinima);
      proximo = indice === 0 ? [n, b] : [a, n];
    } else {
      proximo = n;
    }
    if (arraste.current) arraste.current.ultimo = proximo;
    if (JSON.stringify(proximo) === JSON.stringify(atual)) return proximo;
    if (valorControlado === undefined) setInterno(proximo);
    aoMudar?.(proximo);
    return proximo;
  }

  /** Valor sob o ponteiro, descontando meio polegar em cada ponta. */
  function valorNoPonteiro(e: PointerEvent) {
    // Mede a área onde os polegares correm (na cápsula, o trilho menos a folga)
    const caixa = (polegares.current[0]?.offsetParent ?? trilho.current!).getBoundingClientRect();
    const meio = (polegares.current[0]?.offsetWidth ?? 0) / 2;
    const util = (vertical ? caixa.height : caixa.width) - meio * 2;
    const deslocamento = vertical ? caixa.bottom - e.clientY - meio : e.clientX - caixa.left - meio;
    return min + limitar(deslocamento / util, 0, 1) * (max - min);
  }

  function aoPressionar(e: PointerEvent<HTMLDivElement>) {
    if (desativado || e.button !== 0) return;
    e.preventDefault();
    const alvo = valorNoPonteiro(e);
    // No intervalo, move o polegar mais perto (empate: o que está do lado do clique)
    const indice = intervalo
      ? Math.abs(alvo - valores[0]) < Math.abs(alvo - valores[1]) || (valores[0] === valores[1] && alvo < valores[0])
        ? 0
        : 1
      : 0;
    arraste.current = { indice, ultimo: atual };
    e.currentTarget.setPointerCapture(e.pointerId);
    polegares.current[indice]?.focus();
    mudar(indice, alvo);
  }

  function aoMover(e: PointerEvent<HTMLDivElement>) {
    if (arraste.current) mudar(arraste.current.indice, valorNoPonteiro(e));
  }

  function aoLevantar() {
    if (!arraste.current) return;
    aoSoltar?.(arraste.current.ultimo);
    arraste.current = null;
  }

  // Sem `aoSoltar?.(mudar(...))`: o ?. pularia o mudar junto quando não há aoSoltar
  function soltar(valor: ValorDoControle) {
    aoSoltar?.(valor);
  }

  function aoTeclar(indice: number, e: KeyboardEvent<HTMLDivElement>) {
    if (desativado) return;
    const grande = Math.max(passo, noPasso((max - min) / 10, 0, passo));
    const v = valores[indice];
    if (soNasMarcas && marcas?.length) {
      const ordem = marcas.map((m) => m.valor).sort((x, y) => x - y);
      const pos = ordem.indexOf(v);
      const sobe = ["ArrowRight", "ArrowUp", "PageUp"].includes(e.key);
      const desce = ["ArrowLeft", "ArrowDown", "PageDown"].includes(e.key);
      const alvo = e.key === "Home" ? ordem[0] : e.key === "End" ? ordem[ordem.length - 1] : sobe ? ordem[Math.min(pos + 1, ordem.length - 1)] : desce ? ordem[Math.max(pos - 1, 0)] : undefined;
      if (alvo === undefined) return;
      e.preventDefault();
      soltar(mudar(indice, alvo));
      return;
    }
    const mapa: Record<string, number> = {
      ArrowRight: v + passo,
      ArrowUp: v + passo,
      ArrowLeft: v - passo,
      ArrowDown: v - passo,
      PageUp: v + grande,
      PageDown: v - grande,
      Home: min,
      End: max,
    };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    soltar(mudar(indice, mapa[e.key]));
  }

  const textoDoValor = intervalo ? `${formatar(valores[0])} – ${formatar(valores[1])}` : formatar(valores[0]);
  const inicioDoPreenchimento = intervalo ? valores[0] : min;
  const fimDoPreenchimento = intervalo ? valores[1] : valores[0];

  // Ao longo do trilho: left/width na horizontal, bottom/height na vertical
  const eixo = vertical ? { inicio: "bottom", comprimento: "height" } : { inicio: "left", comprimento: "width" };
  const espessuraStyle = { [vertical ? "width" : "height"]: `calc(var(--spacing) * ${espessura})` };
  const tamanhoDoPolegar = { width: `calc(var(--spacing) * ${polegar})`, height: `calc(var(--spacing) * ${polegar})` };

  // Preenchimento: na cápsula cobre os polegares inteiros; na linha vai de centro a centro
  const meio = `var(--spacing) * ${polegar} / 2`;
  const inicioPx = capsula ? (intervalo ? posicao(inicioDoPreenchimento) : "0px") : intervalo ? `(${posicao(inicioDoPreenchimento)} + ${meio})` : "0px";
  const fimPx = capsula ? `(${posicao(fimDoPreenchimento)} + var(--spacing) * ${polegar})` : `(${posicao(fimDoPreenchimento)} + ${meio})`;
  const transversal = vertical ? "inset-x-0" : "inset-y-0";
  const centralizar = vertical ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2";

  const pista = (
    <>
      <div
        className={`absolute ${cores.preenchimento} ${capsula ? `${raios.dentro} ${transversal}` : `rounded-full ${centralizar}`}`}
        style={{
          ...(capsula ? {} : espessuraStyle),
          [eixo.inicio]: `calc(${inicioPx})`,
          [eixo.comprimento]: `calc(${fimPx} - ${inicioPx})`,
        }}
      />
      {marcas?.map((m) => {
        const dentro = m.valor >= inicioDoPreenchimento && m.valor <= fimDoPreenchimento;
        return (
          <span
            key={m.valor}
            aria-hidden="true"
            className={`pointer-events-none absolute size-1 rounded-full ${centralizar} ${dentro ? "bg-page/80" : "bg-ink/30"}`}
            style={{ [eixo.inicio]: `calc(${posicao(m.valor)} + ${meio} - var(--spacing) * 0.5)` }}
          />
        );
      })}
      {valores.map((v, i) => (
        <div
          key={i}
          ref={(el) => {
            polegares.current[i] = el;
          }}
          role="slider"
          tabIndex={desativado ? -1 : 0}
          aria-labelledby={!intervalo && rotulo ? idRotulo : undefined}
          aria-label={intervalo ? `${rotulo ? `${rotulo}: ` : ""}${rotulosDosPolegares[i]}` : rotulo ? undefined : "Valor"}
          aria-valuemin={intervalo && i === 1 ? valores[0] + distanciaMinima : min}
          aria-valuemax={intervalo && i === 0 ? valores[1] - distanciaMinima : max}
          aria-valuenow={v}
          aria-valuetext={formatar(v)}
          aria-orientation={orientacao}
          aria-disabled={desativado || undefined}
          onKeyDown={(e) => aoTeclar(i, e)}
          className={`absolute z-10 ${centralizar} outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 ${
            capsula ? `${raios.dentro} bg-page shadow-sm` : `rounded-full border-2 bg-page shadow-sm ${cores.borda}`
          }`}
          style={{ ...tamanhoDoPolegar, [eixo.inicio]: posicao(v) }}
        />
      ))}
    </>
  );

  return (
    <div
      className={`flex gap-3 ${vertical ? "h-56 flex-row" : "w-full flex-col"} ${desativado ? "opacity-50" : ""} ${className}`}
    >
      {(rotulo || mostrarValor) && (
        <div className={`flex justify-between gap-3 text-sm ${vertical ? "order-last flex-col justify-end" : "items-baseline"}`}>
          {rotulo && (
            <span id={idRotulo} className="font-medium text-ink">
              {rotulo}
            </span>
          )}
          {mostrarValor && (
            <output aria-hidden="true" className="text-ink-2 tabular-nums">
              {textoDoValor}
            </output>
          )}
        </div>
      )}

      <div className={`relative flex ${vertical ? "h-full flex-row" : "flex-col"} gap-2`}>
        <div
          ref={trilho}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoLevantar}
          onPointerCancel={aoLevantar}
          className={`relative shrink-0 touch-none select-none ${desativado ? "cursor-not-allowed" : "cursor-pointer"} ${
            vertical ? "h-full" : "w-full"
          } flex items-center justify-center`}
          // Área de toque: na "linha", pelo menos a altura do polegar
          style={vertical ? { width: `calc(var(--spacing) * ${Math.max(polegar, espessura)})` } : { height: `calc(var(--spacing) * ${Math.max(polegar, espessura)})` }}
        >
          {/* Trilho */}
          <div
            className={`absolute bg-ink/10 ${capsula ? `${raios.fora} p-1` : "rounded-full"} ${vertical ? "inset-y-0" : "inset-x-0"}`}
            style={espessuraStyle}
          >
            {capsula && <div className="relative size-full">{pista}</div>}
          </div>
          {/* Na linha, polegares e marcas correm por todo o comprimento, acima do trilho fino */}
          {!capsula && <div className="absolute inset-0">{pista}</div>}
        </div>

        {/* Rótulos das marcas */}
        {marcas?.some((m) => m.rotulo) && (
          <div className={`relative text-xs text-muted ${vertical ? "w-10" : "h-4"}`}>
            {marcas.map(
              (m) =>
                m.rotulo && (
                  <button
                    key={m.valor}
                    type="button"
                    tabIndex={-1}
                    disabled={desativado}
                    onClick={() => {
                      // Leva o polegar mais perto até a marca
                      const i = intervalo && Math.abs(m.valor - valores[0]) > Math.abs(m.valor - valores[1]) ? 1 : 0;
                      soltar(mudar(i, m.valor));
                    }}
                    className={`absolute cursor-pointer whitespace-nowrap hover:text-ink disabled:cursor-not-allowed ${
                      vertical ? "translate-y-1/2" : "-translate-x-1/2"
                    }`}
                    style={{
                      [eixo.inicio]: capsula
                        ? `calc(var(--spacing) + ${fracao(m.valor)} * (100% - var(--spacing) * ${polegar + 2}) + var(--spacing) * ${polegar} / 2)`
                        : `calc(${posicao(m.valor)} + var(--spacing) * ${polegar} / 2)`,
                    }}
                  >
                    {m.rotulo}
                  </button>
                ),
            )}
          </div>
        )}
      </div>

      {nome && valores.map((v, i) => <input key={i} type="hidden" name={intervalo ? `${nome}[${i}]` : nome} value={v} />)}
    </div>
  );
}
