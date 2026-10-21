"use client";

import { useId, useMemo, useRef, type ChangeEvent } from "react";

/** Até 15 dígitos (centavos incluídos): fica dentro da precisão exata de um number. */
const MAXIMO_DE_DIGITOS = 15;

/**
 * Campo de valor em dinheiro que formata enquanto se digita: os dígitos entram
 * pela direita, como numa maquininha ("1" → 0,01; "123" → 1,23). Guarda o número,
 * não o texto. Com `valorCalculado`, mostra um botão para restaurar o valor
 * calculado quando a pessoa o substitui.
 */
export function CampoDeMoeda({
  rotulo,
  valor,
  aoMudar,
  moeda = "BRL",
  localidade = "pt-BR",
  valorCalculado,
  rotuloRestaurar = (valorFormatado) => `Restaurar ${valorFormatado}`,
  ajuda,
  placeholder,
  desativado = false,
  nome,
}: {
  rotulo: string;
  /** null = campo vazio. */
  valor: number | null;
  aoMudar: (valor: number | null) => void;
  /** Código ISO 4217 ("BRL", "USD", "EUR"); define o símbolo e as casas decimais. */
  moeda?: string;
  localidade?: string;
  /** Valor de referência (uma fórmula, por exemplo). Se o campo for diferente dele, aparece o botão de restaurar. */
  valorCalculado?: number;
  /** Texto do botão de restaurar, a partir do valor calculado já formatado. */
  rotuloRestaurar?: (valorFormatado: string) => string;
  /** Texto de apoio abaixo do campo. */
  ajuda?: string;
  placeholder?: string;
  desativado?: boolean;
  /** Atributo name do input, para formulários. */
  nome?: string;
}) {
  const id = useId();
  const campo = useRef<HTMLInputElement>(null);
  const formato = useMemo(() => {
    const comMoeda = new Intl.NumberFormat(localidade, { style: "currency", currency: moeda });
    const casas = comMoeda.resolvedOptions().maximumFractionDigits ?? 2;
    const partes = comMoeda.formatToParts(1);
    const posicaoDoSimbolo = partes.findIndex((p) => p.type === "currency");
    return {
      comMoeda,
      casas,
      numero: new Intl.NumberFormat(localidade, { minimumFractionDigits: casas, maximumFractionDigits: casas }),
      simbolo: partes[posicaoDoSimbolo]?.value ?? moeda,
      simboloAntes: posicaoDoSimbolo < partes.findIndex((p) => p.type === "integer"),
    };
  }, [moeda, localidade]);

  const emUnidades = (n: number) => Math.round(n * 10 ** formato.casas);
  const editado = valorCalculado !== undefined && (valor === null || emUnidades(valor) !== emUnidades(valorCalculado));

  function aoDigitar(e: ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, MAXIMO_DE_DIGITOS);
    if (!digitos) {
      // Apagar até o zero esvazia o campo; digitar "0" num campo vazio dá zero
      const apagando = (e.nativeEvent as InputEvent).inputType?.startsWith("delete");
      aoMudar(apagando || e.target.value === "" ? null : 0);
      return;
    }
    aoMudar(Number(digitos) / 10 ** formato.casas);
  }

  const idAjuda = `${id}-ajuda`;
  const simbolo = (
    <span aria-hidden="true" className="shrink-0 text-sm text-muted">
      {formato.simbolo}
    </span>
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {rotulo}
          {/* O símbolo ao lado do número é decorativo; a moeda entra no nome do campo */}
          <span className="sr-only"> ({formato.simbolo})</span>
        </label>
        {valorCalculado !== undefined && editado && !desativado && (
          <button
            type="button"
            onClick={() => {
              aoMudar(valorCalculado ?? null);
              // O botão some depois de restaurar: o foco vai para o campo em vez de se perder
              campo.current?.focus();
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-ink-2 outline-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {rotuloRestaurar(formato.comMoeda.format(valorCalculado))}
          </button>
        )}
      </div>
      <div
        className={`flex min-h-11 items-center gap-2 rounded-lg border bg-page px-3 outline-accent focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-2 ${
          desativado ? "border-rule opacity-60" : "border-rule-strong"
        }`}
      >
        {formato.simboloAntes && simbolo}
        <input
          ref={campo}
          id={id}
          name={nome}
          inputMode="numeric"
          autoComplete="off"
          value={valor === null ? "" : formato.numero.format(valor)}
          onChange={aoDigitar}
          placeholder={placeholder ?? formato.numero.format(0)}
          disabled={desativado}
          aria-describedby={ajuda ? idAjuda : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-right text-base text-ink tabular-nums outline-none placeholder:text-muted disabled:cursor-not-allowed"
        />
        {!formato.simboloAntes && simbolo}
      </div>
      {ajuda && (
        <p id={idAjuda} className="text-xs text-muted">
          {ajuda}
        </p>
      )}
    </div>
  );
}
