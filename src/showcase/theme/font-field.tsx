"use client";

import { useId, useState } from "react";
import { ALL_FONTS, fontStack } from "@/themes/fonts";

/**
 * Campo de fonte: sugere as fontes conhecidas, mas aceita qualquer nome do
 * Google Fonts. Aplica ao escolher uma sugestão, ao apertar Enter ou ao sair.
 * Para refletir mudanças de fora, renderize com `key={value}`.
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
    const limpo = nome.trim();
    if (limpo && limpo !== value) onChange(limpo);
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
