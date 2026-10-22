"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/**
 * Aplica uma máscara simples ao que foi digitado: `0` é dígito, `A` é letra e
 * `*` é qualquer caractere; o resto da máscara é fixo. "(00) 00000-0000"
 * transforma "11987654321" em "(11) 98765-4321".
 */
export function aplicarMascara(valor: string, mascara: string) {
  const aceita = { "0": /\d/, A: /[a-z]/i, "*": /./ } as Record<string, RegExp>;
  const brutos = [...valor].filter((c) => /[a-z\d]/i.test(c));
  let resultado = "";
  let i = 0;
  for (const simbolo of mascara) {
    if (i >= brutos.length) break;
    const regra = aceita[simbolo];
    if (!regra) {
      resultado += simbolo;
      continue;
    }
    // Descarta o que não serve para esta posição (uma letra onde vai dígito)
    while (i < brutos.length && !regra.test(brutos[i])) i++;
    if (i < brutos.length) resultado += brutos[i++];
  }
  return resultado;
}

/**
 * Medidas de cada tamanho. Classes inteiras de propósito: o Tailwind só gera as
 * classes que aparecem escritas no código. `folga` abre espaço à direita para a
 * seta da seleção ou para os botões de mostrar senha e limpar busca.
 */
export const TAMANHOS = {
  sm: {
    altura: "h-9",
    raio: "rounded-lg",
    texto: "text-sm",
    vertical: "py-2",
    esquerda: "pl-3",
    comIcone: "pl-9",
    direita: "pr-3",
    folga: "pr-9",
    icone: "left-3 [&_svg]:size-4",
    iconeNoTopo: "top-2.5",
    acao: "right-1 size-7 [&_svg]:size-4",
    rotulo: "text-xs",
    espaco: "mt-1.5",
  },
  md: {
    altura: "h-12",
    raio: "rounded-xl",
    texto: "text-sm",
    vertical: "py-3",
    esquerda: "pl-4",
    comIcone: "pl-11",
    direita: "pr-4",
    folga: "pr-11",
    icone: "left-4 [&_svg]:size-[18px]",
    iconeNoTopo: "top-3.5",
    acao: "right-1.5 size-9 [&_svg]:size-[18px]",
    rotulo: "text-sm",
    espaco: "mt-2",
  },
  lg: {
    altura: "h-14",
    raio: "rounded-xl",
    texto: "text-base",
    vertical: "py-3.5",
    esquerda: "pl-5",
    comIcone: "pl-12",
    direita: "pr-5",
    folga: "pr-14",
    icone: "left-4 [&_svg]:size-5",
    iconeNoTopo: "top-4",
    acao: "right-2 size-10 [&_svg]:size-5",
    rotulo: "text-sm",
    espaco: "mt-2",
  },
} as const;

export type TamanhoDoCampo = keyof typeof TAMANHOS;

/** Classes do controle: tamanho, espaço para ícone e ações, e a borda de erro quando `erro` é verdadeiro. */
export function classesDoControle({
  erro = false,
  comIcone = false,
  tamanho = "md",
  folgaDireita = false,
  multilinha = false,
}: {
  erro?: boolean;
  /** Abre espaço à esquerda para o ícone. */
  comIcone?: boolean;
  tamanho?: TamanhoDoCampo;
  /** Abre espaço à direita para uma seta ou um botão. */
  folgaDireita?: boolean;
  /** Área de texto: altura pelo conteúdo, e não fixa. */
  multilinha?: boolean;
} = {}) {
  const t = TAMANHOS[tamanho];
  return [
    "block w-full border bg-surface text-ink outline-none transition-[color,background-color,border-color,box-shadow] placeholder:text-muted focus:bg-page focus:ring-3 disabled:cursor-not-allowed disabled:opacity-60",
    t.raio,
    t.texto,
    multilinha ? `${t.vertical} min-h-24 resize-y leading-relaxed` : t.altura,
    comIcone ? t.comIcone : t.esquerda,
    folgaDireita ? t.folga : t.direita,
    erro
      ? "border-critical focus:border-critical focus:ring-critical/15"
      : "border-rule hover:border-axis focus:border-accent focus:ring-accent/15",
  ].join(" ");
}

/** O que o Campo preenche no controle filho. */
type PreenchidoPeloCampo = {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  comIcone?: boolean;
  erro?: boolean;
  tamanho?: TamanhoDoCampo;
};

/**
 * Rótulo, ícone opcional à esquerda, controle e mensagem de erro ou de ajuda,
 * já ligados por id (`aria-invalid` e `aria-describedby` vão para o controle).
 * O filho é o controle: Entrada, Selecao, AreaDeTexto, EntradaDeSenha,
 * BarraDeBusca ou qualquer input/select/textarea.
 */
export function Campo({
  rotulo,
  icone,
  erro,
  ajuda,
  obrigatorio = false,
  tamanho,
  children,
}: {
  rotulo: ReactNode;
  /**
   * Ícone (SVG) dentro do controle, à esquerda. Na BarraDeBusca a lupa já vem
   * com ela; num <input> comum, abra o espaço com `classesDoControle({ comIcone: true })`.
   */
  icone?: ReactNode;
  /** Mensagem de erro; deixa a borda vermelha e é lida junto com o campo. */
  erro?: string;
  /** Texto de apoio abaixo do campo, quando não há erro. */
  ajuda?: ReactNode;
  /** Marca o rótulo com um asterisco e avisa leitores de tela (`aria-required`). */
  obrigatorio?: boolean;
  /** Tamanho do controle e do rótulo. Padrão: o do controle filho, ou "md". */
  tamanho?: TamanhoDoCampo;
  children: ReactElement<PreenchidoPeloCampo>;
}) {
  const idGerado = useId();
  const valido = isValidElement(children);
  const propsDoFilho: PreenchidoPeloCampo = valido ? children.props : {};
  const id = propsDoFilho.id || idGerado;
  const idMensagem = `${id}-mensagem`;
  const mensagem = erro ?? ajuda;
  const medida = tamanho ?? propsDoFilho.tamanho ?? "md";
  const t = TAMANHOS[medida];

  const tipo = valido ? children.type : null;
  // A BarraDeBusca (de outra pasta) se marca com `temLupa`, sem import circular
  const comLupa = Boolean(tipo && (tipo as { temLupa?: boolean }).temLupa);
  // Os controles da biblioteca recebem também o estado visual; um <input> comum, só o que é HTML
  const nosso =
    tipo === Entrada || tipo === Selecao || tipo === AreaDeTexto || tipo === EntradaDeSenha || comLupa;
  const comIcone = Boolean(icone) && !comLupa;
  const descritoPor = [propsDoFilho["aria-describedby"], mensagem ? idMensagem : undefined].filter(Boolean).join(" ");

  const controle = valido
    ? cloneElement(children, {
        id,
        "aria-invalid": erro ? true : propsDoFilho["aria-invalid"],
        "aria-describedby": descritoPor || undefined,
        "aria-required": obrigatorio || propsDoFilho["aria-required"] || undefined,
        ...(nosso ? { erro: Boolean(erro), tamanho: medida } : {}),
        // A busca não recebe comIcone: a lupa dela já ocupa a esquerda
        ...(nosso && !comLupa ? { comIcone } : {}),
      })
    : children;

  return (
    <div>
      <label htmlFor={id} className={`block font-medium text-ink ${t.rotulo}`}>
        {rotulo}
        {obrigatorio && (
          <span aria-hidden className="ml-1 text-critical">
            *
          </span>
        )}
      </label>
      <div className={`relative ${t.espaco}`}>
        {controle}
        {/* Depois do controle no DOM, para ficar por cima do fundo dele */}
        {comIcone && (
          <span
            aria-hidden
            className={`pointer-events-none absolute text-muted ${t.icone} ${
              tipo === AreaDeTexto ? t.iconeNoTopo : "top-1/2 -translate-y-1/2"
            }`}
          >
            {icone}
          </span>
        )}
      </div>
      {mensagem && (
        <p id={idMensagem} className={`mt-1.5 text-xs ${erro ? "text-critical" : "text-muted"}`}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

export type Visual = {
  /** Preenchido pelo Campo quando ele tem ícone. */
  comIcone?: boolean;
  /** Borda de erro. Dentro de um Campo, vem da prop `erro` dele. */
  erro?: boolean;
  tamanho?: TamanhoDoCampo;
};

type PropsDaEntrada = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> &
  Visual & {
    /** Máscara aplicada ao digitar: "(00) 00000-0000", "00.000.000/0000-00", "00000-000"... */
    mascara?: string;
    /** Recebe o valor já formatado pela máscara. */
    onChange?: (valor: string) => void;
  };

/** Campo de texto no estilo do tema, com máscara opcional. `onChange` recebe o valor já formatado. */
export function Entrada({ mascara, onChange, comIcone, erro, tamanho = "md", className = "", ...props }: PropsDaEntrada) {
  return (
    <input
      {...props}
      onChange={(e) => onChange?.(mascara ? aplicarMascara(e.target.value, mascara) : e.target.value)}
      className={`${classesDoControle({ erro, comIcone, tamanho })} ${className}`}
    />
  );
}

type PropsDaArea = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> &
  Visual & {
    onChange?: (valor: string) => void;
  };

/** Texto de várias linhas no mesmo estilo; a altura vem de `rows` e a pessoa pode esticar na vertical. */
export function AreaDeTexto({ onChange, comIcone, erro, tamanho = "md", rows = 4, className = "", ...props }: PropsDaArea) {
  return (
    <textarea
      {...props}
      rows={rows}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${classesDoControle({ erro, comIcone, tamanho, multilinha: true })} ${className}`}
    />
  );
}

type PropsDaSelecao = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> &
  Visual & {
    opcoes: Array<{ valor: string; rotulo: string }>;
    /** Primeira opção vazia ("Selecione..."). */
    vazio?: string;
    /** Recebe o valor da opção escolhida. */
    onChange?: (valor: string) => void;
  };

/** Seleção nativa no estilo do tema, com a seta desenhada. */
export function Selecao({ opcoes, vazio, onChange, comIcone, erro, tamanho = "md", className = "", ...props }: PropsDaSelecao) {
  const t = TAMANHOS[tamanho];
  return (
    <div className="relative">
      <select
        {...props}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${classesDoControle({ erro, comIcone, tamanho, folgaDireita: true })} cursor-pointer appearance-none ${className}`}
      >
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <span aria-hidden className={`pointer-events-none absolute top-1/2 grid -translate-y-1/2 place-items-center text-muted ${t.acao}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}

export const BOTAO_INTERNO =
  "absolute top-1/2 grid -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted outline-accent transition-colors hover:bg-track hover:text-ink focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50";

type PropsDaSenha = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "size"> &
  Visual & {
    onChange?: (valor: string) => void;
    /** Nome do botão do olho. O estado (mostrando ou não) vai em `aria-pressed`. */
    rotuloMostrar?: string;
  };

/**
 * Senha com o botão de mostrar e ocultar. O botão é um alternador: o nome não
 * muda e `aria-pressed` diz se a senha está à mostra; o ícone troca o olho.
 */
export function EntradaDeSenha({
  onChange,
  comIcone,
  erro,
  tamanho = "md",
  rotuloMostrar = "Mostrar senha",
  className = "",
  ...props
}: PropsDaSenha) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visivel ? "text" : "password"}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${classesDoControle({ erro, comIcone, tamanho, folgaDireita: true })} ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        disabled={props.disabled}
        aria-pressed={visivel}
        aria-label={rotuloMostrar}
        aria-controls={props.id}
        title={rotuloMostrar}
        className={`${BOTAO_INTERNO} ${TAMANHOS[tamanho].acao}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          {visivel ? (
            <>
              <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              <path d="m3 3 18 18" />
            </>
          ) : (
            <>
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
