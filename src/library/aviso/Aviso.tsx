import type { ReactNode } from "react";

const ESTILO = {
  info: { rotulo: "Info", cor: "text-accent", icone: "info" },
  sucesso: { rotulo: "Pronto", cor: "text-success", icone: "ok" },
  alerta: { rotulo: "Atenção", cor: "text-warning", icone: "triangulo" },
  erro: { rotulo: "Erro", cor: "text-critical", icone: "triangulo" },
} as const;

export type TipoDeAviso = keyof typeof ESTILO;

/** Mensagem de status com ícone e rótulo escrito além da cor, para não depender só dela. */
export function Aviso({
  tipo = "info",
  rotulo,
  children,
}: {
  tipo?: TipoDeAviso;
  /** Substitui o rótulo padrão do tipo ("Atenção", "Erro"...). */
  rotulo?: string;
  children: ReactNode;
}) {
  const estilo = ESTILO[tipo];
  return (
    <div role={tipo === "erro" ? "alert" : "status"} className="flex items-start gap-3 rounded-xl bg-surface p-5">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`mt-0.5 h-5 w-5 shrink-0 ${estilo.cor}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {estilo.icone === "triangulo" && (
          <>
            <path d="M12 3 2.5 20h19L12 3z" />
            <path d="M12 10v4" />
            <path d="M12 17.5h.01" />
          </>
        )}
        {estilo.icone === "info" && (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 7.5h.01" />
          </>
        )}
        {estilo.icone === "ok" && (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12.5 2.5 2.5L16 9.5" />
          </>
        )}
      </svg>
      <p>
        <strong>{rotulo ?? estilo.rotulo}:</strong> {children}
      </p>
    </div>
  );
}
