"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FocusEvent, type ReactNode } from "react";
import { CURVA_SUAVE, useSemMovimento } from "@/library/revelar/Movimento";
import estilos from "./NavegacaoFlutuante.module.css";

export type LinkDaNavegacao = { rotulo: string; href: string };

export type MarcaDaNavegacao = {
  nome: string;
  /** Símbolo da marca (SVG, <img>...). É o que sobra quando o nome colapsa. */
  logo?: ReactNode;
  href: string;
};

type Pilula = { x: number; y: number; largura: number; visivel: boolean; saltar: boolean };

function assinarRolagem(aviso: () => void) {
  window.addEventListener("scroll", aviso, { passive: true });
  return () => window.removeEventListener("scroll", aviso);
}

const FOCO = "outline-accent focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * Barra de navegação flutuante em pílula, centralizada, sobre uma camada de
 * vidro. Uma pílula desliza sob o item em que o mouse (ou o foco) está; ao rolar
 * a página, o nome da marca colapsa e sobra só o logo. Abaixo de `lg`, os links
 * vão para um menu (botão com aria-expanded; Esc ou clique fora fecham).
 */
export function NavegacaoFlutuante({
  marca,
  links,
  acao,
  atual,
  colapsarApos = 80,
  fixa = true,
  rotulo = "Navegação principal",
  rotuloDoMenu = "Menu",
}: {
  marca: MarcaDaNavegacao;
  links: LinkDaNavegacao[];
  /** Chamada à direita da barra (um botão ou link de contato, por exemplo). Fica fora da pílula. */
  acao?: ReactNode;
  /** `href` do link da página atual: recebe aria-current="page" e fica destacado. */
  atual?: string;
  /** Rolagem (px) a partir da qual o nome da marca colapsa e sobra só o logo. `false` desliga. Sem logo, não colapsa. */
  colapsarApos?: number | false;
  /** Fixa no topo da tela, centralizada. Com `false`, fica no fluxo normal da página. */
  fixa?: boolean;
  /** Nome da navegação para leitores de tela (aria-label do <nav>). */
  rotulo?: string;
  /** Rótulo do botão que abre os links no celular. */
  rotuloDoMenu?: string;
}) {
  const semMovimento = useSemMovimento();
  const rolou = useSyncExternalStore(
    assinarRolagem,
    () => colapsarApos !== false && window.scrollY > colapsarApos,
    () => false,
  );
  const colapsada = Boolean(marca.logo) && rolou;

  const [pilula, setPilula] = useState<Pilula>({ x: 0, y: 0, largura: 0, visivel: false, saltar: true });
  const itemSobAPilula = useRef<HTMLElement | null>(null);

  const [aberto, setAberto] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const botaoDoMenu = useRef<HTMLButtonElement>(null);
  const idDoPainel = useId();

  // A pílula se mede pelo item: offsetLeft/offsetWidth relativos à barra.
  const mover = (item: HTMLElement) => {
    itemSobAPilula.current = item;
    setPilula((p) => ({
      x: item.offsetLeft,
      y: item.offsetTop,
      largura: item.offsetWidth,
      visivel: true,
      // Vindo de invisível, aparece já no lugar em vez de deslizar de onde parou.
      saltar: !p.visivel,
    }));
  };
  const esconder = () => {
    itemSobAPilula.current = null;
    setPilula((p) => ({ ...p, visivel: false }));
  };

  // Ao tirar o mouse, a pílula volta para o item com foco de teclado, se houver.
  const aoSairDoMouse = () => {
    const foco = document.activeElement;
    if (foco instanceof HTMLElement && foco.dataset.pilula !== undefined && foco.matches(":focus-visible")) mover(foco);
    else esconder();
  };
  const aoSairDoFoco = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) esconder();
  };
  // Enquanto o nome da marca colapsa, os itens andam: a pílula acompanha no fim.
  const remedir = () => {
    if (itemSobAPilula.current) mover(itemSobAPilula.current);
  };

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAberto(false);
      botaoDoMenu.current?.focus();
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const eventosDaPilula = {
    "data-pilula": "",
    onMouseEnter: (e: { currentTarget: HTMLElement }) => mover(e.currentTarget),
    onFocus: (e: { currentTarget: HTMLElement }) => mover(e.currentTarget),
  };

  return (
    <div
      className={
        fixa
          ? "pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4 lg:top-6"
          : "relative z-40 flex justify-center px-4 py-1.5"
      }
    >
      <nav
        ref={nav}
        aria-label={rotulo}
        className={`pointer-events-auto relative max-w-full ${estilos.entrada} ${semMovimento ? estilos.parado : ""}`}
      >
        <div className="relative flex max-w-full items-center" onMouseLeave={aoSairDoMouse} onBlur={aoSairDoFoco}>
          {/* Camada de vidro, um pouco maior que o grupo de itens. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-3xl border border-rule bg-page/70 shadow-flutuante backdrop-blur-md"
          />

          {/* Pílula que desliza sob o item em foco ou sob o mouse. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-11 rounded-2xl bg-ink/10"
            style={{
              width: pilula.largura,
              transform: `translate(${pilula.x}px, ${pilula.y}px)`,
              opacity: pilula.visivel ? 1 : 0,
              transition:
                semMovimento || pilula.saltar
                  ? "opacity 250ms ease-out"
                  : `transform 350ms ${CURVA_SUAVE}, width 350ms ${CURVA_SUAVE}, opacity 250ms ease-out`,
            }}
          />

          <a
            href={marca.href}
            aria-current={atual === marca.href ? "page" : undefined}
            className={`relative z-10 flex h-11 min-w-0 items-center rounded-2xl px-3 text-ink ${FOCO}`}
            {...eventosDaPilula}
          >
            {marca.logo && (
              <span aria-hidden="true" className="flex shrink-0 items-center">
                {marca.logo}
              </span>
            )}
            {/* O nome colapsa animando a coluna do grid de 1fr para 0fr: sem medir a largura. Continua
                no DOM (só fica sem largura), então segue sendo o nome acessível do link. */}
            <span
              className={`grid min-w-0 ${colapsada ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"}`}
              style={{
                transition: semMovimento
                  ? undefined
                  : "grid-template-columns 450ms cubic-bezier(0.65, 0, 0.35, 1), opacity 450ms cubic-bezier(0.65, 0, 0.35, 1)",
              }}
              onTransitionEnd={remedir}
            >
              {/* Em telas estreitas o nome encolhe com reticências em vez de empurrar a barra para fora */}
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className={`pr-1 text-sm font-semibold tracking-tight ${marca.logo ? "pl-2" : ""}`}>
                  {marca.nome}
                </span>
              </span>
            </span>
          </a>

          <ul className="hidden items-center lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={atual === l.href ? "page" : undefined}
                  className={`relative z-10 flex h-11 items-center rounded-2xl px-3.5 text-sm whitespace-nowrap transition-colors duration-300 ${FOCO} ${
                    atual === l.href ? "font-medium text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                  {...eventosDaPilula}
                >
                  {l.rotulo}
                </a>
              </li>
            ))}
          </ul>

          {acao && (
            <div className="relative z-10 ml-1.5 flex shrink-0 items-center" onMouseEnter={esconder}>
              {acao}
            </div>
          )}

          {links.length > 0 && (
            <button
              ref={botaoDoMenu}
              type="button"
              aria-expanded={aberto}
              aria-controls={idDoPainel}
              aria-label={rotuloDoMenu}
              onClick={() => setAberto((a) => !a)}
              onMouseEnter={esconder}
              className={`relative z-10 ml-1 grid size-11 shrink-0 cursor-pointer place-items-center rounded-2xl text-ink transition-colors hover:bg-ink/10 lg:hidden ${FOCO}`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                {aberto ? (
                  <path d="M6 6l12 12M18 6 6 18" />
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Menu do celular: some no lg, onde os links já estão na barra. */}
        <div
          id={idDoPainel}
          hidden={!aberto}
          className="absolute top-full left-1/2 mt-4 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-rule bg-page p-2 shadow-flutuante lg:hidden"
        >
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={atual === l.href ? "page" : undefined}
                  onClick={() => setAberto(false)}
                  className={`flex min-h-11 items-center rounded-2xl px-4 text-base transition-colors hover:bg-ink/10 hover:text-ink ${FOCO} ${
                    atual === l.href ? "font-medium text-ink" : "text-ink-2"
                  }`}
                >
                  {l.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
