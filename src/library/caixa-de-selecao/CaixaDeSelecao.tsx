"use client";

import { useId, type ChangeEvent, type ComponentPropsWithRef, type ReactNode, type Ref } from "react";

type PropsNativas = Omit<ComponentPropsWithRef<"input">, "type" | "checked" | "size" | "children">;

function atribuirRef<T>(ref: Ref<T> | undefined, valor: T | null) {
  if (typeof ref === "function") ref(valor);
  else if (ref) ref.current = valor;
}

/**
 * Corpo comum da caixa e do rádio: o navegador cuida do comportamento (um rádio
 * marcado por `name`, setas entre rádios, espaço marca), e aqui só entram o
 * visual pelos tokens e o vínculo com rótulo e descrição.
 */
function Marcavel({
  tipo,
  rotulo,
  descricao,
  marcado,
  indeterminado = false,
  className = "",
  disabled,
  ref,
  onChange,
  aoMarcar,
  ...resto
}: PropsNativas & {
  tipo: "checkbox" | "radio";
  rotulo?: ReactNode;
  descricao?: ReactNode;
  marcado?: boolean;
  indeterminado?: boolean;
  aoMarcar?: (evento: ChangeEvent<HTMLInputElement>) => void;
}) {
  const idRotulo = useId();
  const idDescricao = useId();
  const temTexto = rotulo != null || descricao != null;

  const caixa = (
    <input
      type={tipo}
      checked={marcado}
      disabled={disabled}
      // O label envolve tudo (a área de clique inclui o texto), então o nome viria do
      // rótulo E da descrição juntos: aria-labelledby/-describedby separam os dois.
      aria-labelledby={rotulo != null ? idRotulo : undefined}
      aria-describedby={descricao != null ? idDescricao : undefined}
      // `indeterminate` só existe como propriedade do DOM, não como atributo. A ref é
      // refeita a cada render para reaplicar o estado depois de um clique, que o apaga.
      ref={(el) => {
        if (el && tipo === "checkbox") el.indeterminate = indeterminado;
        atribuirRef(ref, el);
      }}
      onChange={(e) => {
        onChange?.(e);
        aoMarcar?.(e);
      }}
      className={`size-4 shrink-0 cursor-pointer accent-accent outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${
        temTexto ? "mt-0.5" : `disabled:opacity-50 ${className}`
      }`}
      {...resto}
    />
  );

  // Sem texto (célula de uma matriz, por exemplo), só a caixa: passe `aria-label`.
  if (!temTexto) return caixa;

  return (
    <label
      className={`flex items-start gap-2.5 text-sm text-ink ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
    >
      {caixa}
      <span className="flex min-w-0 flex-col gap-0.5">
        {rotulo != null && <span id={idRotulo}>{rotulo}</span>}
        {descricao != null && (
          <span id={idDescricao} className="text-xs text-muted">
            {descricao}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * Caixa de marcação nativa com rótulo e descrição opcional, na cor de destaque
 * do tema. Aceita o estado misto (`indeterminado`) para o "marcar todos" de uma
 * lista parcialmente marcada. Repassa as props nativas do `<input>` (`name`,
 * `value`, `defaultChecked`, `onChange`, `ref`...).
 */
export function CaixaDeSelecao({
  aoMudar,
  ...props
}: {
  /** A frase ao lado da caixa. Sem ela (e sem descrição), sai só a caixa: passe `aria-label`. */
  rotulo?: ReactNode;
  /** Texto de apoio abaixo do rótulo, ligado à caixa por `aria-describedby`. */
  descricao?: ReactNode;
  /** Estado controlado. Omita (e use `defaultChecked`) para deixar o navegador cuidar. */
  marcado?: boolean;
  /** Recebe o novo estado a cada clique. */
  aoMudar?: (marcado: boolean) => void;
  /** Estado misto (traço no lugar do ✓), anunciado como "parcialmente marcado". */
  indeterminado?: boolean;
  /** Classes do `<label>` que envolve tudo (ou da caixa, quando não há texto). */
  className?: string;
} & PropsNativas) {
  return <Marcavel tipo="checkbox" aoMarcar={(e) => aoMudar?.(e.target.checked)} {...props} />;
}

/**
 * Botão de rádio nativo, com o mesmo corpo da caixa de marcação. Dê o mesmo
 * `name` às opções de um grupo e envolva-as num `<fieldset>` com `<legend>`:
 * o navegador cuida de marcar uma só e das setas entre elas.
 */
export function OpcaoDeRadio({
  aoEscolher,
  ...props
}: {
  /** A frase ao lado do rádio. Sem ela (e sem descrição), sai só o rádio: passe `aria-label`. */
  rotulo?: ReactNode;
  /** Texto de apoio abaixo do rótulo, ligado ao rádio por `aria-describedby`. */
  descricao?: ReactNode;
  /** Estado controlado: se esta é a opção escolhida. */
  marcado?: boolean;
  /** Chamado quando esta opção passa a ser a escolhida. */
  aoEscolher?: () => void;
  /** Classes do `<label>` que envolve tudo (ou do rádio, quando não há texto). */
  className?: string;
} & PropsNativas) {
  return (
    <Marcavel
      tipo="radio"
      aoMarcar={(e) => {
        if (e.target.checked) aoEscolher?.();
      }}
      {...props}
    />
  );
}
