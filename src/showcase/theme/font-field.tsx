"use client";

import { useId, useState } from "react";
import { ALL_FONTS, fonteConhecida, fontStack } from "@/themes/fonts";

/**
 * Campo de fonte: só aceita as fontes da vitrine (a lista de sugestões). Aplica ao
 * escolher uma sugestão, ao apertar Enter ou ao sair; um nome fora da lista volta ao
 * valor atual. Para refletir mudanças de fora, renderize com `key={value}`.
 */
export function FontField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (familia: string) => void;
  className?: string;
}) {
  const id = useId();
  const [texto, setTexto] = useState(value);

  function confirmar(nome = texto) {
    const fonte = fonteConhecida(nome);
    if (!fonte) {
      setTexto(value);
      return;
    }
    setTexto(fonte);
    if (fonte !== value) onChange(fonte);
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium opacity-70">{label}</span>
      <input
        list={id}
        value={texto}
        spellCheck={false}
        onChange={(e) => {
          setTexto(e.target.value);
          if (ALL_FONTS.includes(e.target.value)) confirmar(e.target.value);
        }}
        onBlur={() => confirmar()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            confirmar();
          }
        }}
        style={{ fontFamily: fontStack(value, "vault") }}
        className={`min-h-10 w-full rounded-md border px-3 text-sm outline-none ${className}`}
      />
      <datalist id={id}>
        {ALL_FONTS.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
    </label>
  );
}
