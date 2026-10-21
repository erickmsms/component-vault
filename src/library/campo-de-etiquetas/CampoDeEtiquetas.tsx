"use client";

import { useId, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";

/** Textos do campo; troque para concordar com o que é digitado ("Remover cenário X"...). */
export type TextosDasEtiquetas = {
  placeholder: string;
  /** Nome do botão × de cada etiqueta. */
  remover: (etiqueta: string) => string;
  repetida: (etiqueta: string) => string;
  limite: (maximo: number) => string;
  contador: (quantidade: number, maximo: number) => string;
};

const TEXTOS_PADRAO: TextosDasEtiquetas = {
  placeholder: "Digite e tecle Enter",
  remover: (etiqueta) => `Remover ${etiqueta}`,
  repetida: (etiqueta) => `“${etiqueta}” já está na lista.`,
  limite: (maximo) => `Limite de ${maximo} atingido.`,
  contador: (quantidade, maximo) => `${quantidade} de ${maximo}`,
};

const comparavel = (texto: string) => texto.trim().toLocaleLowerCase("pt-BR");

/**
 * Campo de etiquetas: digite e tecle Enter (ou um separador, como a vírgula) para
 * virar etiqueta. Backspace com o campo vazio apaga a última, o × remove qualquer
 * uma e colar "a, b, c" cria várias de uma vez. Ignora repetidas e respeita um
 * máximo, avisando por aria-live.
 */
export function CampoDeEtiquetas({
  rotulo,
  valor,
  aoMudar,
  sugestoes,
  maximo,
  separadores = [","],
  permitirRepetidas = false,
  ajuda,
  desativado = false,
  textos: textosParciais,
}: {
  rotulo: string;
  valor: string[];
  aoMudar: (etiquetas: string[]) => void;
  /** Lista de sugestões do navegador (datalist); as já escolhidas somem dela. */
  sugestoes?: string[];
  /** Quantidade máxima de etiquetas. */
  maximo?: number;
  /** Teclas que também fecham a etiqueta e separam o texto colado (Enter e quebra de linha sempre valem). */
  separadores?: string[];
  /** Por padrão, uma etiqueta igual a outra (sem diferenciar maiúsculas) é ignorada. */
  permitirRepetidas?: boolean;
  /** Texto de apoio abaixo do campo. */
  ajuda?: string;
  desativado?: boolean;
  textos?: Partial<TextosDasEtiquetas>;
}) {
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  const id = useId();
  const campo = useRef<HTMLInputElement>(null);
  const [rascunho, setRascunho] = useState("");
  const [mensagem, setMensagem] = useState("");
  const noLimite = maximo !== undefined && valor.length >= maximo;

  const dividir = (texto: string) => {
    let partes = [texto];
    for (const separador of [...separadores, "\n"]) partes = partes.flatMap((p) => p.split(separador));
    return partes;
  };

  /** Acrescenta as que puder, na ordem, e avisa da última que ficou de fora. Falso se parou no limite. */
  function adicionar(novas: string[]): boolean {
    const lista = [...valor];
    let aviso = "";
    let parou = false;
    for (const bruta of novas) {
      const etiqueta = bruta.trim();
      if (!etiqueta) continue;
      if (maximo !== undefined && lista.length >= maximo) {
        aviso = textos.limite(maximo);
        parou = true;
        break;
      }
      if (!permitirRepetidas && lista.some((e) => comparavel(e) === comparavel(etiqueta))) {
        aviso = textos.repetida(etiqueta);
        continue;
      }
      lista.push(etiqueta);
    }
    if (lista.length !== valor.length) aoMudar(lista);
    setMensagem(aviso);
    return !parou;
  }

  function remover(indice: number) {
    aoMudar(valor.filter((_, i) => i !== indice));
    setMensagem("");
    campo.current?.focus();
  }

  function aoDigitar(e: ChangeEvent<HTMLInputElement>) {
    const texto = e.target.value;
    const tipo = (e.nativeEvent as InputEvent).inputType;
    // Escolha na lista de sugestões chega inteira, sem digitação: já vira etiqueta
    if (sugestoes?.includes(texto) && (tipo === undefined || tipo === "insertReplacementText")) {
      adicionar([texto]);
      setRascunho("");
      return;
    }
    const partes = dividir(texto);
    if (partes.length > 1) {
      // O que veio antes do separador vira etiqueta; o resto continua no campo
      adicionar(partes.slice(0, -1));
      setRascunho(partes[partes.length - 1]);
      return;
    }
    setRascunho(texto);
    if (mensagem) setMensagem("");
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && rascunho.trim()) {
      // Não envia o formulário em volta
      e.preventDefault();
      // No limite, o texto fica no campo para não se perder
      if (adicionar([rascunho])) setRascunho("");
    } else if (e.key === "Backspace" && rascunho === "" && valor.length > 0) {
      e.preventDefault();
      aoMudar(valor.slice(0, -1));
      setMensagem("");
    }
  }

  function aoColar(e: ClipboardEvent<HTMLInputElement>) {
    const colado = e.clipboardData.getData("text");
    const partes = dividir(colado);
    if (partes.length < 2) return;
    e.preventDefault();
    adicionar(dividir(rascunho + partes[0]).concat(partes.slice(1)));
    setRascunho("");
  }

  function aoSair() {
    if (rascunho.trim() && adicionar([rascunho])) setRascunho("");
  }

  const disponiveis = sugestoes?.filter((s) => !valor.some((e) => comparavel(e) === comparavel(s)));
  const idAjuda = `${id}-ajuda`;
  const temRodape = ajuda || maximo !== undefined || mensagem;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {rotulo}
      </label>
      {/* Clicar no espaço vazio da caixa leva ao campo de texto */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) campo.current?.focus();
        }}
        className={`flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border bg-page px-2 py-1.5 outline-accent focus-within:outline-2 focus-within:outline-offset-2 ${
          desativado ? "cursor-not-allowed border-rule opacity-60" : "cursor-text border-rule-strong focus-within:border-accent"
        }`}
      >
        {valor.length > 0 && (
          <ul aria-label={rotulo} className="flex flex-wrap gap-1.5">
            {valor.map((etiqueta, i) => (
              <li
                key={`${etiqueta}-${i}`}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-rule bg-surface py-0.5 pr-1 pl-3 text-sm text-ink"
              >
                <span className="min-w-0 truncate">{etiqueta}</span>
                {!desativado && (
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    aria-label={textos.remover(etiqueta)}
                    className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-muted outline-accent hover:bg-page hover:text-accent focus-visible:outline-2"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <input
          ref={campo}
          id={id}
          value={rascunho}
          onChange={aoDigitar}
          onKeyDown={aoTeclar}
          onPaste={aoColar}
          onBlur={aoSair}
          disabled={desativado}
          list={disponiveis?.length ? `${id}-sugestoes` : undefined}
          aria-describedby={temRodape ? idAjuda : undefined}
          placeholder={noLimite ? "" : textos.placeholder}
          autoComplete="off"
          enterKeyHint="enter"
          className="min-h-8 min-w-32 flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed"
        />
        {disponiveis && disponiveis.length > 0 && (
          <datalist id={`${id}-sugestoes`}>
            {disponiveis.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>
      {/* Região de anúncio sempre presente (precisa existir antes da mensagem para ser lida) */}
      <p aria-live="polite" className="sr-only">
        {mensagem}
      </p>
      {temRodape && (
        <div id={idAjuda} className="flex items-start justify-between gap-3 text-xs">
          {mensagem ? (
            <p aria-hidden="true" className="font-medium text-ink-2">
              {mensagem}
            </p>
          ) : (
            <p className="text-muted">{ajuda}</p>
          )}
          {maximo !== undefined && (
            <span className={`shrink-0 tabular-nums ${noLimite ? "font-semibold text-ink-2" : "text-muted"}`}>
              {textos.contador(valor.length, maximo)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
