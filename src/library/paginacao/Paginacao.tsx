import { Botao } from "@/library/botao/Botao";

export type TextosDaPaginacao = { anterior: string; proxima: string };

const TEXTOS_PADRAO: TextosDaPaginacao = { anterior: "Anterior", proxima: "Próxima" };

// Primeira e última sempre; no meio, a atual com os vizinhos. Buraco de uma página mostra o número.
function paginasVisiveis(pagina: number, total: number, vizinhos: number): (number | "…")[] {
  let inicio = Math.max(2, pagina - vizinhos);
  let fim = Math.min(total - 1, pagina + vizinhos);
  if (inicio === 3) inicio = 2;
  if (fim === total - 2) fim = total - 1;
  const meio = Array.from({ length: Math.max(0, fim - inicio + 1) }, (_, i) => inicio + i);
  return [1, ...(inicio > 2 ? ["…" as const] : []), ...meio, ...(fim < total - 1 ? ["…" as const] : []), total];
}

function Seta({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/**
 * Paginação para tabelas e listas: anterior/próxima, números das páginas com reticências
 * quando são muitas e a página atual em destaque. Controlada: a página vem por `pagina`.
 */
export function Paginacao({
  pagina,
  totalDePaginas,
  aoMudar,
  vizinhos = 1,
  rotulo = "Paginação",
  textos: textosParciais,
}: {
  /** Página atual, começando em 1. */
  pagina: number;
  /** Total de páginas. Com uma página só, nada aparece. */
  totalDePaginas: number;
  /** Chamado com a página escolhida. */
  aoMudar: (pagina: number) => void;
  /** Quantas páginas mostrar de cada lado da atual. */
  vizinhos?: number;
  /** Nome da região para leitores de tela. */
  rotulo?: string;
  /** Textos dos botões anterior e próxima. */
  textos?: Partial<TextosDaPaginacao>;
}) {
  if (totalDePaginas <= 1) return null;
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  const atual = Math.min(Math.max(1, pagina), totalDePaginas);

  return (
    <nav aria-label={rotulo}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <Botao
            variante="fantasma"
            tamanho="sm"
            disabled={atual === 1}
            onClick={() => aoMudar(atual - 1)}
            icone={<Seta d="m15 18-6-6 6-6" />}
          >
            {textos.anterior}
          </Botao>
        </li>
        {paginasVisiveis(atual, totalDePaginas, vizinhos).map((item, indice) =>
          item === "…" ? (
            <li key={`reticencias-${indice}`} aria-hidden="true" className="px-1 text-sm text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Botao
                variante={item === atual ? "primario" : "fantasma"}
                tamanho="sm"
                className="min-w-8 tabular-nums"
                aria-current={item === atual ? "page" : undefined}
                onClick={() => aoMudar(item)}
              >
                {item}
              </Botao>
            </li>
          ),
        )}
        <li>
          <Botao
            variante="fantasma"
            tamanho="sm"
            disabled={atual === totalDePaginas}
            onClick={() => aoMudar(atual + 1)}
            iconeFinal={<Seta d="m9 18 6-6-6-6" />}
          >
            {textos.proxima}
          </Botao>
        </li>
      </ul>
    </nav>
  );
}
