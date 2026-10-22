"use client";

import { useRef } from "react";
import { CURVA_SUAVE, useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/** Faixa de cor: vale do fim da faixa anterior até `ate` (a última faixa pode omitir `ate`). */
export type FaixaDoMedidor = { ate?: number; cor: string; rotulo?: string };

export type MedidorSolidoProps = {
  valor: number;
  min?: number;
  max?: number;
  /** Nome do indicador: vira o título acessível e aparece abaixo do número. */
  rotulo: string;
  /** Formata o número do centro e os limites ("69%", "R$ 69 mil"). */
  formatar?: (valor: number) => string;
  /** Cor do arco. Com `faixas`, a cor vem da faixa em que o valor cai. */
  cor?: string;
  /** Muda a cor do arco conforme o valor (ex.: até 60 bom, até 85 atenção, acima crítico). */
  faixas?: FaixaDoMedidor[];
  /** Grossura do arco em relação ao raio, de 0,1 a 0,5. */
  espessura?: number;
  /** Mostra o mínimo e o máximo nas pontas do arco. */
  mostrarLimites?: boolean;
};

const limitar = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/** Ponto do arco: 0 é a ponta esquerda, 1 a direita, passando pelo topo. */
function ponto(f: number, r: number, cx: number, cy: number) {
  const angulo = Math.PI * (1 - f);
  // Duas casas: servidor e navegador podem diferir na última casa do seno (erro de hidratação)
  return [Math.round((cx + r * Math.cos(angulo)) * 100) / 100, Math.round((cy - r * Math.sin(angulo)) * 100) / 100] as const;
}

/** Faixa de arco entre as frações `a` e `b`, entre os raios interno e externo. */
function setor(a: number, b: number, rFora: number, rDentro: number, cx: number, cy: number) {
  const [x1, y1] = ponto(a, rFora, cx, cy);
  const [x2, y2] = ponto(b, rFora, cx, cy);
  const [x3, y3] = ponto(b, rDentro, cx, cy);
  const [x4, y4] = ponto(a, rDentro, cx, cy);
  return `M${x1},${y1} A${rFora},${rFora} 0 0 1 ${x2},${y2} L${x3},${y3} A${rDentro},${rDentro} 0 0 0 ${x4},${y4} Z`;
}

/**
 * Medidor de meia-volta para um único número em relação a um limite: arco sólido sobre um
 * trilho, número grande no centro e limites nas pontas. O arco cresce ao entrar na tela (ou
 * aparece direto com "reduzir movimento") e pode mudar de cor por faixas. Exposto como
 * `role="meter"` para leitores de tela.
 */
export function MedidorSolido({
  valor,
  min = 0,
  max = 100,
  rotulo,
  formatar = (n) => n.toLocaleString("pt-BR"),
  cor = "var(--series-1)",
  faixas,
  espessura = 0.32,
  mostrarLimites = true,
}: MedidorSolidoProps) {
  const ref = useRef<SVGSVGElement>(null);
  const semMovimento = useSemMovimento();
  const visivel = useEmTela(ref);
  const mostrar = semMovimento || visivel;

  const f = max === min ? 0 : limitar((valor - min) / (max - min), 0, 1);
  const corAtual = faixas?.find((fx) => fx.ate === undefined || valor <= fx.ate)?.cor ?? cor;
  const faixaAtual = faixas?.find((fx) => fx.ate === undefined || valor <= fx.ate);

  // Coordenadas num quadro de 200 x 118: o arco ocupa a metade de cima de um círculo de raio 90
  const cx = 100;
  const cy = 100;
  const rFora = 90;
  const rDentro = rFora * (1 - limitar(espessura, 0.1, 0.5));
  const meio = (rFora + rDentro) / 2;
  const grossura = rFora - rDentro;
  // O arco de valor é um traço grosso sobre a linha central; o comprimento anima com dasharray
  const comprimento = Math.round(Math.PI * meio * 100) / 100;
  const [ix, iy] = ponto(0, meio, cx, cy);
  const [fx, fy] = ponto(1, meio, cx, cy);

  return (
    <figure className="m-0 flex w-full max-w-xs flex-col items-center">
      <svg
        ref={ref}
        viewBox="0 0 200 118"
        className="w-full overflow-visible"
        role="meter"
        aria-label={rotulo}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={valor}
        aria-valuetext={`${formatar(valor)}${faixaAtual?.rotulo ? `, ${faixaAtual.rotulo}` : ""}`}
      >
        <path d={setor(0, 1, rFora, rDentro, cx, cy)} fill="var(--grid)" />
        {/* Ponta reta no início (encosta na base) e arredondada no fim, como as barras */}
        <path
          d={`M${ix},${iy} A${meio},${meio} 0 0 1 ${fx},${fy}`}
          fill="none"
          stroke={corAtual}
          strokeWidth={grossura}
          strokeDasharray={`${comprimento} ${comprimento}`}
          strokeDashoffset={mostrar ? comprimento * (1 - f) : comprimento}
          style={semMovimento ? undefined : { transition: `stroke-dashoffset 900ms ${CURVA_SUAVE}, stroke 300ms` }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-ink font-display font-bold tabular-nums" style={{ fontSize: 30 }}>
          {formatar(valor)}
        </text>
        {mostrarLimites && (
          <>
            <text x={cx - meio} y={cy + 15} textAnchor="middle" className="fill-ink-2 font-semibold tabular-nums" style={{ fontSize: 10 }}>
              {formatar(min)}
            </text>
            <text x={cx + meio} y={cy + 15} textAnchor="middle" className="fill-ink-2 font-semibold tabular-nums" style={{ fontSize: 10 }}>
              {formatar(max)}
            </text>
          </>
        )}
      </svg>
      <figcaption className="-mt-1 text-center text-sm text-ink-2">
        {rotulo}
        {faixaAtual?.rotulo && (
          <span className="ml-2 inline-flex items-center gap-1.5 font-medium text-ink">
            <span aria-hidden="true" className="inline-block size-2 rounded-full" style={{ background: corAtual }} />
            {faixaAtual.rotulo}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
