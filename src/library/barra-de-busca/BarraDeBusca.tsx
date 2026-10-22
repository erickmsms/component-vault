"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type InputHTMLAttributes } from "react";
import { BOTAO_INTERNO, classesDoControle, TAMANHOS, type Visual } from "@/library/campo-de-formulario/Campo";

const nadaMuda = () => () => {};

type PropsDaBusca = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "size" | "value" | "defaultValue"> &
  Omit<Visual, "comIcone"> & {
    /** Texto buscado. Sem `value`, o campo guarda o próprio estado (começando em `valorInicial`). */
    value?: string;
    valorInicial?: string;
    onChange?: (valor: string) => void;
    /** Chamado depois do botão de limpar (ou do Esc com texto), quando o campo já está vazio. */
    aoLimpar?: () => void;
    /** Nome do botão × para leitores de tela. */
    rotuloLimpar?: string;
    /**
     * Ctrl+K (⌘K no Mac) em qualquer lugar da página leva o foco para a busca, e
     * a dica do atalho aparece à direita enquanto o campo está vazio. Use em uma
     * barra só por página.
     */
    atalho?: boolean;
  };

/**
 * Busca com a lupa à esquerda e um botão para limpar quando há texto. O Esc
 * também limpa (e só fecha um modal em volta quando o campo já está vazio).
 * Funciona sozinha ou dentro de um Campo, que lhe passa rótulo e erro.
 */
export function BarraDeBusca({
  value,
  valorInicial = "",
  onChange,
  aoLimpar,
  rotuloLimpar = "Limpar busca",
  atalho = false,
  erro,
  tamanho = "md",
  placeholder = "Buscar...",
  className = "",
  ...props
}: PropsDaBusca) {
  const entrada = useRef<HTMLInputElement>(null);
  const [interno, setInterno] = useState(valorInicial);
  // No servidor não dá para saber o sistema: mostra "Ctrl K" e troca para ⌘K no Mac depois de hidratar
  const mac = useSyncExternalStore(
    nadaMuda,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
  const atual = value ?? interno;
  const t = TAMANHOS[tamanho];
  const comDica = atalho && !atual;

  useEffect(() => {
    if (!atalho) return;
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        entrada.current?.focus();
        entrada.current?.select();
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [atalho]);

  function mudar(valor: string) {
    if (value === undefined) setInterno(valor);
    onChange?.(valor);
  }

  function limpar() {
    mudar("");
    aoLimpar?.();
    entrada.current?.focus();
  }

  return (
    <div className="relative">
      <input
        {...props}
        ref={entrada}
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        value={atual}
        aria-keyshortcuts={atalho ? "Control+K Meta+K" : props["aria-keyshortcuts"]}
        onChange={(e) => mudar(e.target.value)}
        onKeyDown={(e) => {
          props.onKeyDown?.(e);
          if (e.key === "Escape" && atual) {
            e.preventDefault();
            limpar();
          }
        }}
        // O × nativo do navegador some: o botão de limpar é o nosso
        className={`peer ${classesDoControle({ erro, comIcone: true, tamanho, folgaDireita: Boolean(atual) })} [&::-webkit-search-cancel-button]:appearance-none ${comDica ? "pr-16" : ""} ${className}`}
      />
      <span aria-hidden className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${t.icone}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      {comDica && (
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-rule bg-page px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted peer-focus:hidden"
        >
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      )}
      {atual && (
        <button
          type="button"
          onClick={limpar}
          disabled={props.disabled}
          aria-label={rotuloLimpar}
          title={rotuloLimpar}
          className={`${BOTAO_INTERNO} ${t.acao}`}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Marca lida pelo Campo: a lupa já ocupa a esquerda, então ele não abre espaço para outro ícone. */
BarraDeBusca.temLupa = true;
