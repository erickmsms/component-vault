import type { ReactNode } from "react";
import { enderecoSeguro } from "@/library/botao/enderecoSeguro";

/**
 * Abertura de página em duas colunas: link de voltar, chapéu, título grande,
 * resumo e chamada de um lado; imagem (ou outra mídia) de cantos bem
 * arredondados do outro. No celular, empilha com o texto primeiro. Para só a
 * manchete, sem mídia, veja a `Abertura`.
 */
export function AberturaComImagem({
  voltar,
  chapeu,
  titulo,
  resumo,
  acao,
  midia,
  imagem,
  inverter = false,
  proporcao = "3 / 2",
  fundo = "superficie",
  className = "",
}: {
  /** Link de volta acima do chapéu ("← Voltar aos serviços"). */
  voltar?: { rotulo: string; href: string };
  /** Linha curta acima do título: categoria, seção, contexto. */
  chapeu?: string;
  titulo: ReactNode;
  /** Parágrafo abaixo do título. */
  resumo?: ReactNode;
  /** Chamada abaixo do resumo (botão ou link). */
  acao?: ReactNode;
  /** Mídia própria (vídeo, ilustração, mapa...); ocupa a moldura toda. Tem prioridade sobre `imagem`. */
  midia?: ReactNode;
  /** Imagem da moldura, recortada para caber (object-cover). */
  imagem?: { src: string; alt: string };
  /** Põe a mídia à esquerda nas telas largas. */
  inverter?: boolean;
  /** Proporção da moldura da mídia (CSS aspect-ratio). */
  proporcao?: string;
  /** "superficie" pinta a faixa com a cor de superfície; "nenhum" deixa transparente. */
  fundo?: "superficie" | "nenhum";
  /** Classes extras no <section> (por exemplo, mais respiro no topo para uma navegação flutuante). */
  className?: string;
}) {
  const temMidia = Boolean(midia || imagem);

  return (
    <section className={`w-full py-16 lg:py-24 ${fundo === "superficie" ? "bg-surface" : ""} ${className}`}>
      <div
        className={`mx-auto grid max-w-[100rem] items-center gap-12 px-6 sm:px-10 lg:gap-20 lg:px-16 ${
          temMidia
            ? inverter
              ? "lg:grid-cols-[minmax(0,44%)_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,44%)]"
            : ""
        }`}
      >
        <div>
          {voltar && (
            <a
              href={enderecoSeguro(voltar.href)}
              className="inline-flex items-center gap-2 rounded-sm text-sm text-ink-2 outline-accent transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span aria-hidden="true">←</span> {voltar.rotulo}
            </a>
          )}

          {chapeu && (
            <p className={`text-xs font-semibold tracking-[0.14em] text-accent uppercase ${voltar ? "mt-8" : ""}`}>
              {chapeu}
            </p>
          )}

          <h1
            className={`max-w-2xl font-display text-4xl leading-[1.1] font-bold tracking-[-0.01em] sm:text-5xl lg:text-6xl ${
              voltar || chapeu ? "mt-4" : ""
            }`}
          >
            {titulo}
          </h1>

          {resumo && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{resumo}</p>}

          {acao && <div className="mt-10">{acao}</div>}
        </div>

        {temMidia && (
          <div
            className={`relative overflow-hidden rounded-3xl bg-track lg:rounded-4xl ${inverter ? "lg:order-first" : ""}`}
            style={{ aspectRatio: proporcao }}
          >
            {midia ??
              (imagem && (
                // eslint-disable-next-line @next/next/no-img-element -- a biblioteca não depende de next/image
                <img src={imagem.src} alt={imagem.alt} className="absolute inset-0 size-full object-cover" />
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
