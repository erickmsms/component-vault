import type { ReactNode } from "react";
import { enderecoSeguro } from "@/library/botao/enderecoSeguro";

export type LinkDoRodape = { rotulo: string; href: string };

export type GrupoDeLinks = { titulo: string; links: LinkDoRodape[] };

// Ícones preenchidos (viewBox 0 0 24 24). Facebook, Instagram, X, LinkedIn e WhatsApp vêm do original.
const ICONES = {
  facebook: { d: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" },
  instagram: {
    d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.8-.8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  },
  x: { d: "M3 3h4.5l4.2 5.8L16.8 3H21l-6.9 8L21.4 21h-4.5l-4.6-6.3L6.9 21H3l7.2-8.4L3 3Z" },
  linkedin: {
    d: "M4.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h3v12H3V9Zm6 0h3v1.7c.6-1 1.8-2 3.6-2 2.7 0 4.4 1.8 4.4 5V21h-3v-6.6c0-1.7-.7-2.7-2.2-2.7-1.3 0-2.1.9-2.4 1.7-.1.3-.1.7-.1 1V21H9V9Z",
  },
  youtube: {
    d: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z",
    vazado: true,
  },
  github: {
    d: "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.58l-.02-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z",
  },
  whatsapp: {
    d: "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.6c.12.17 1.77 2.71 4.3 3.8.6.26 1.07.42 1.44.53.6.2 1.15.17 1.58.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.47-.29Z",
  },
} satisfies Record<string, { d: string; vazado?: boolean }>;

export type RedeConhecida = keyof typeof ICONES;

export type RedeSocial = {
  /** Nome da rede: vira o rótulo do link para leitores de tela. */
  nome: string;
  href: string;
  /** Ícone pronto da rede. */
  rede?: RedeConhecida;
  /** Ícone próprio (SVG de 20px com currentColor); tem prioridade sobre `rede`. */
  icone?: ReactNode;
};

export type ContatoDoRodape = {
  /** Título da coluna. Padrão: "Contato". */
  titulo?: string;
  /** Linhas do endereço. */
  endereco?: string[];
  /** Telefone já formatado e o link dele (`tel:+55...`). */
  telefone?: LinkDoRodape;
  email?: string;
  /** Outros contatos (WhatsApp, agenda...). Links http abrem em nova aba. */
  extras?: LinkDoRodape[];
};

const externo = (href: string) => /^https?:\/\//.test(href);
const novaAba = (href: string) => (externo(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

const FOCO = "rounded-sm outline-accent focus-visible:outline-2 focus-visible:outline-offset-2";
const LINK = `text-ink-2 transition-colors hover:text-ink ${FOCO}`;

function IconeDaRede({ rede }: { rede: RedeConhecida }) {
  const icone: { d: string; vazado?: boolean } = ICONES[rede];
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d={icone.d} fillRule={icone.vazado ? "evenodd" : undefined} />
    </svg>
  );
}

/**
 * Rodapé alto em duas partes: de um lado a frase de fecho, a chamada e as redes
 * sociais; do outro os grupos de links lado a lado e a coluna de contato. Embaixo,
 * a marca e os direitos. Para um rodapé de uma linha, veja o `Rodape`.
 */
export function RodapeEmColunas({
  frase,
  acao,
  redes = [],
  grupos = [],
  contato,
  marca,
  direitos,
  subtitulo,
  rotuloDasRedes = "Redes sociais",
}: {
  /** Frase de fecho em letras grandes (font-display). */
  frase: ReactNode;
  /** Chamada abaixo da frase (botão ou link). */
  acao?: ReactNode;
  redes?: RedeSocial[];
  /** Listas de links lado a lado, cada uma com um título. */
  grupos?: GrupoDeLinks[];
  /** Coluna de contato depois dos grupos: endereço, telefone, e-mail e extras. */
  contato?: ContatoDoRodape;
  /** Logo ou nome da marca, no canto inferior. */
  marca?: ReactNode;
  /** Linha de direitos ("© 2026 Empresa. Todos os direitos reservados."). */
  direitos?: ReactNode;
  /** Linha abaixo dos direitos (slogan, CNPJ...). */
  subtitulo?: ReactNode;
  /** Nome da lista de redes sociais para leitores de tela. */
  rotuloDasRedes?: string;
}) {
  const temContato =
    contato && (contato.endereco?.length || contato.telefone || contato.email || contato.extras?.length);

  return (
    <footer className="w-full bg-surface text-ink">
      <div className="mx-auto flex max-w-[100rem] flex-col justify-between gap-16 px-6 pt-20 pb-10 sm:px-10 lg:min-h-[32rem] lg:flex-row lg:px-16 lg:pt-32">
        <div className="max-w-md">
          <p className="font-display text-3xl leading-[1.15] font-bold sm:text-4xl">{frase}</p>

          {acao && <div className="mt-8">{acao}</div>}

          {redes.length > 0 && (
            <ul aria-label={rotuloDasRedes} className="mt-10 flex flex-wrap items-center gap-5">
              {redes.map((r) => (
                <li key={`${r.nome}-${r.href}`}>
                  <a
                    href={enderecoSeguro(r.href)}
                    aria-label={r.nome}
                    className={`block text-ink-2 transition-colors hover:text-ink ${FOCO}`}
                    {...novaAba(r.href)}
                  >
                    {r.icone ?? (r.rede ? <IconeDaRede rede={r.rede} /> : <span className="text-sm">{r.nome}</span>)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(grupos.length > 0 || temContato) && (
          <div className="flex flex-col gap-12 sm:flex-row sm:flex-wrap sm:gap-16 lg:flex-nowrap lg:gap-20 lg:pr-8">
            {grupos.map((g) => (
              <nav key={g.titulo} aria-label={g.titulo}>
                <p className="text-sm font-medium">{g.titulo}</p>
                <ul className="mt-4 space-y-3">
                  {g.links.map((l) => (
                    <li key={`${l.rotulo}-${l.href}`}>
                      <a href={enderecoSeguro(l.href)} className={LINK} {...novaAba(l.href)}>
                        {l.rotulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            {temContato && (
              <div className="max-w-xs">
                <p className="text-sm font-medium">{contato.titulo ?? "Contato"}</p>
                <ul className="mt-4 space-y-3 text-ink-2">
                  {contato.endereco && contato.endereco.length > 0 && (
                    <li>
                      <address className="leading-relaxed not-italic">
                        {contato.endereco.map((linha, i) => (
                          <span key={i} className="block">
                            {linha}
                          </span>
                        ))}
                      </address>
                    </li>
                  )}
                  {contato.telefone && (
                    <li>
                      <a href={enderecoSeguro(contato.telefone.href)} className={LINK}>
                        {contato.telefone.rotulo}
                      </a>
                    </li>
                  )}
                  {contato.email && (
                    <li>
                      <a href={`mailto:${contato.email}`} className={`break-all ${LINK}`}>
                        {contato.email}
                      </a>
                    </li>
                  )}
                  {contato.extras?.map((l) => (
                    <li key={`${l.rotulo}-${l.href}`}>
                      <a href={enderecoSeguro(l.href)} className={LINK} {...novaAba(l.href)}>
                        {l.rotulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {(marca || direitos || subtitulo) && (
        <div className="mx-auto max-w-[100rem] px-6 pb-10 sm:px-10 lg:px-16">
          <div className="flex flex-col items-center gap-8 border-t border-rule pt-10 sm:flex-row sm:justify-between sm:gap-6">
            {marca && <div className="shrink-0">{marca}</div>}
            {(direitos || subtitulo) && (
              <div className="flex flex-col gap-1 text-center text-sm text-muted sm:ml-auto sm:text-right">
                {direitos && <p>{direitos}</p>}
                {subtitulo && <p>{subtitulo}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
