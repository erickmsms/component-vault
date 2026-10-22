"use client";

import { Botao } from "@/library/botao/Botao";
import { useId, useState, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

export type ItemDaBarraLateral = {
  rotulo: string;
  /** Destino do link. Sem `href` (e sem filhos), o item vira um botão que chama `aoClicar`. */
  href?: string;
  /** Ícone (SVG de ~20px). Sem ícone, aparece a inicial do rótulo. */
  icone?: ReactNode;
  /** Página atual. Num grupo, marcar um filho como ativo abre o grupo e destaca o pai. */
  ativo?: boolean;
  /** Número ou selo à direita ("12", "Novo"). Recolhida, vira um ponto no ícone. */
  contador?: number | string;
  /** Subitens: o item vira um grupo que abre e fecha. Um nível só. */
  filhos?: ItemDaBarraLateral[];
  aoClicar?: () => void;
  /** Linha divisória antes do item, para separar seções (ex.: administração). */
  separarAntes?: boolean;
};

/** O que `renderizarLink` recebe: repasse tudo ao seu componente de link. */
export type PropsDoLink = {
  href: string;
  className: string;
  children: ReactNode;
  title?: string;
  "aria-label"?: string;
  "aria-current"?: "page";
};

type Conteudo = ReactNode | ((recolhida: boolean) => ReactNode);

const linkPadrao = (props: PropsDoLink) => <a {...props} />;

const LINHA =
  "relative flex w-full cursor-pointer items-center overflow-hidden rounded-lg text-left outline-accent focus-visible:outline-2 focus-visible:-outline-offset-2";
const ATIVA =
  "bg-accent/10 font-semibold text-accent before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-accent";
const INATIVA = "text-ink-2 hover:bg-surface hover:text-ink";

/** Chave de um grupo: o rótulo basta (dois grupos com o mesmo nome confundiriam a pessoa também). */
const chave = (item: ItemDaBarraLateral) => item.rotulo;

/**
 * Barra lateral de navegação que recolhe para uma faixa só de ícones (com o nome
 * no `title`). Tem grupos que abrem como sanfona, indicador do item atual,
 * contadores, cabeçalho (marca) e rodapé (conta) e o botão de recolher na borda.
 *
 * Os links são `<a>`; para usar o link do seu roteador, passe `renderizarLink`.
 * `recolhida` pode ser controlada (com `aoMudarRecolhida`) ou não (`recolhidaInicial`).
 * Ocupa a altura do contêiner: coloque-a num pai com altura definida.
 */
export function BarraLateral({
  itens,
  cabecalho,
  rodape,
  recolhida: recolhidaControlada,
  recolhidaInicial = false,
  aoMudarRecolhida,
  renderizarLink = linkPadrao,
  umGrupoPorVez = true,
  rotulo = "Navegação principal",
  textos = { recolher: "Recolher menu", expandir: "Expandir menu" },
}: {
  itens: ItemDaBarraLateral[];
  /** Topo (marca). Pode ser uma função que recebe `recolhida` para mostrar só o símbolo. */
  cabecalho?: Conteudo;
  /** Pé (conta, ajuda). Também aceita uma função de `recolhida`. */
  rodape?: Conteudo;
  /** Estado controlado. Use com `aoMudarRecolhida`. */
  recolhida?: boolean;
  /** Estado inicial quando não controlada. */
  recolhidaInicial?: boolean;
  aoMudarRecolhida?: (recolhida: boolean) => void;
  /** Troca o `<a>` pelo link do roteador: `(p) => <Link {...p} />`. */
  renderizarLink?: (props: PropsDoLink) => ReactNode;
  /** Abrir um grupo fecha o outro. */
  umGrupoPorVez?: boolean;
  /** Nome da navegação para leitores de tela. */
  rotulo?: string;
  textos?: { recolher: string; expandir: string };
}) {
  const semMovimento = useSemMovimento();
  const idNav = useId();
  const [recolhidaInterna, setRecolhidaInterna] = useState(recolhidaInicial);
  const recolhida = recolhidaControlada ?? recolhidaInterna;

  function mudarRecolhida(valor: boolean) {
    if (recolhidaControlada === undefined) setRecolhidaInterna(valor);
    aoMudarRecolhida?.(valor);
  }

  // O grupo do item ativo começa aberto e reabre quando a página atual muda para outro grupo
  // (ajuste durante a renderização, sem efeito: não pinta um quadro com o grupo errado).
  const grupoAtivo = itens.find((i) => i.filhos?.some((f) => f.ativo));
  const chaveAtiva = grupoAtivo ? chave(grupoAtivo) : null;
  const [abertos, setAbertos] = useState<string[]>(chaveAtiva ? [chaveAtiva] : []);
  const [chaveAnterior, setChaveAnterior] = useState(chaveAtiva);
  if (chaveAtiva !== chaveAnterior) {
    setChaveAnterior(chaveAtiva);
    if (chaveAtiva && !abertos.includes(chaveAtiva)) setAbertos(umGrupoPorVez ? [chaveAtiva] : [...abertos, chaveAtiva]);
  }

  function alternarGrupo(item: ItemDaBarraLateral) {
    const k = chave(item);
    if (recolhida) {
      // Recolhida, os filhos não cabem: abre a barra já com o grupo aberto.
      mudarRecolhida(false);
      setAbertos((a) => (umGrupoPorVez ? [k] : a.includes(k) ? a : [...a, k]));
      return;
    }
    setAbertos((a) => (a.includes(k) ? a.filter((x) => x !== k) : umGrupoPorVez ? [k] : [...a, k]));
  }

  const transicao = semMovimento ? "" : "transition-opacity";
  // Ao recolher, o texto some rápido, antes de a faixa ficar estreita e cortá-lo; ao abrir, espera o espaço aparecer.
  const someRecolhida = recolhida ? `opacity-0 ${semMovimento ? "" : "duration-100"}` : `opacity-100 ${semMovimento ? "" : "delay-100 duration-200"}`;
  const resolver = (c: Conteudo | undefined) => (typeof c === "function" ? c(recolhida) : c);

  function conteudoDaLinha(item: ItemDaBarraLateral, extra?: ReactNode) {
    return (
      <>
        <span aria-hidden="true" className="relative flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">
          {item.icone ?? <span className="text-sm font-bold uppercase">{item.rotulo.slice(0, 1)}</span>}
          {recolhida && item.contador !== undefined && (
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-accent ring-2 ring-page" />
          )}
        </span>
        <span className={`min-w-0 flex-1 truncate whitespace-nowrap ${transicao} ${someRecolhida}`}>{item.rotulo}</span>
        {item.contador !== undefined && (
          <span
            className={`shrink-0 rounded-[max(var(--radius-sm),calc(var(--radius-lg)_-_var(--spacing)*3))] px-2 py-0.5 text-xs leading-none font-semibold tabular-nums ${transicao} ${someRecolhida} ${
              item.ativo ? "bg-accent text-page" : "bg-surface text-ink-2"
            }`}
          >
            {item.contador}
          </span>
        )}
        {extra}
      </>
    );
  }

  /** Nome acessível quando recolhida (só o ícone aparece): inclui o contador. */
  const nomeRecolhido = (item: ItemDaBarraLateral) =>
    recolhida ? `${item.rotulo}${item.contador !== undefined ? ` (${item.contador})` : ""}` : undefined;

  function linhaSimples(item: ItemDaBarraLateral, filho = false) {
    const classe = `${LINHA} ${filho ? "h-9 gap-2 pr-3 pl-11.5 text-sm [&_svg]:size-4" : "h-11 gap-3 px-3.5 text-sm"} ${item.ativo ? ATIVA : INATIVA}`;
    // Filhos só aparecem com a barra aberta: ícone pequeno opcional, rótulo e contador discreto.
    const conteudo = filho ? (
      <>
        {item.icone && (
          <span aria-hidden="true" className="flex shrink-0">
            {item.icone}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
        {item.contador !== undefined && <span className="shrink-0 text-xs text-muted tabular-nums">{item.contador}</span>}
      </>
    ) : (
      conteudoDaLinha(item)
    );
    if (item.href !== undefined) {
      return renderizarLink({
        href: item.href,
        className: classe,
        title: recolhida ? item.rotulo : undefined,
        "aria-label": nomeRecolhido(item),
        "aria-current": item.ativo ? "page" : undefined,
        children: conteudo,
      });
    }
    return (
      <button
        type="button"
        onClick={item.aoClicar}
        title={recolhida ? item.rotulo : undefined}
        aria-label={nomeRecolhido(item)}
        aria-current={item.ativo ? "page" : undefined}
        className={classe}
      >
        {conteudo}
      </button>
    );
  }

  return (
    <div
      className={`relative flex h-full shrink-0 flex-col border-r border-rule bg-page py-4 ${recolhida ? "w-20" : "w-64"} ${
        semMovimento ? "" : "transition-[width] duration-300 ease-in-out"
      }`}
    >
      <Botao
        variante="contorno"
        tamanho="xs"
        soIcone
        arredondado
        onClick={() => mudarRecolhida(!recolhida)}
        aria-label={recolhida ? textos.expandir : textos.recolher}
        title={recolhida ? textos.expandir : textos.recolher}
        aria-expanded={!recolhida}
        aria-controls={idNav}
        className="absolute top-6 -right-3.5 z-10 bg-page"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-4 ${recolhida ? "rotate-180" : ""} ${semMovimento ? "" : "transition-transform duration-300"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
      </Botao>

      {cabecalho !== undefined && <div className="mb-4 flex min-h-10 shrink-0 items-center overflow-hidden px-4">{resolver(cabecalho)}</div>}

      <nav id={idNav} aria-label={rotulo} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4">
        <ul className="flex flex-col gap-1">
          {itens.map((item, indice) => {
            const separador = item.separarAntes ? "mt-2 border-t border-rule pt-3" : "";
            if (!item.filhos?.length) {
              return (
                <li key={item.rotulo} className={separador}>
                  {linhaSimples(item)}
                </li>
              );
            }

            const aberto = !recolhida && abertos.includes(chave(item));
            const contemAtivo = item.filhos.some((f) => f.ativo);
            const idFilhos = `${idNav}-grupo-${indice}`;
            return (
              <li key={item.rotulo} className={separador}>
                <button
                  type="button"
                  onClick={() => alternarGrupo(item)}
                  aria-expanded={aberto}
                  aria-controls={aberto ? idFilhos : undefined}
                  title={recolhida ? item.rotulo : undefined}
                  aria-label={nomeRecolhido(item)}
                  className={`${LINHA} h-11 gap-3 px-3.5 text-sm ${contemAtivo && !aberto ? ATIVA : INATIVA}`}
                >
                  {conteudoDaLinha(
                    item,
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={`size-4 shrink-0 ${transicao} ${someRecolhida} ${aberto ? "" : "-rotate-90"}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>,
                  )}
                </button>
                {aberto && (
                  <ul id={idFilhos} className="mt-0.5 mb-1 flex flex-col gap-0.5">
                    {item.filhos.map((filho) => (
                      <li key={filho.rotulo}>{linhaSimples(filho, true)}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {rodape !== undefined && (
        <div className="mt-3 shrink-0 overflow-hidden border-t border-rule px-4 pt-3">{resolver(rodape)}</div>
      )}
    </div>
  );
}
