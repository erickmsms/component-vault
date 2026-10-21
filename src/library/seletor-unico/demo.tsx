import { useState } from "react";
import { SeletorUnico } from "./SeletorUnico";

const PERIODOS = [
  { valor: "7d", rotulo: "Últimos 7 dias" },
  { valor: "30d", rotulo: "Últimos 30 dias" },
  { valor: "ano", rotulo: "Este ano" },
] as const;

type Periodo = (typeof PERIODOS)[number]["valor"];

export default function SeletorUnicoDemo() {
  const [periodo, setPeriodo] = useState<Periodo>("30d");

  return (
    <div className="flex min-h-56 items-start justify-center">
      <SeletorUnico rotulo="Período" opcoes={PERIODOS} valor={periodo} aoEscolher={setPeriodo} />
    </div>
  );
}
