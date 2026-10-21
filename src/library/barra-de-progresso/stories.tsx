import { useEffect, useState } from "react";
import { defineStories } from "@/registry/stories";
import { BarraDeProgresso } from "./BarraDeProgresso";

type Tom = "destaque" | "sucesso" | "alerta" | "perigo";

const deItens = (v: number, m: number) => `${v} de ${m} (${Math.round((v / m) * 100)}%)`;

function EnvioSimulado() {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setValor((v) => (v >= 100 ? 0 : Math.min(100, v + 7))), 400);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="w-full max-w-md">
      <BarraDeProgresso
        valor={valor}
        rotulo={valor >= 100 ? "Concluindo..." : "Enviando planilha.xlsx..."}
        tamanho="md"
      />
    </div>
  );
}

export default defineStories({
  args: {
    rotulo: "Enviando contrato.pdf...",
    valor: 45,
    maximo: 100,
    indeterminada: false,
    tom: "destaque",
    tamanho: "sm",
    mostrarValor: true,
    ocultarRotulo: false,
  },
  controls: {
    rotulo: { type: "text" },
    valor: { type: "number", min: 0, max: 100 },
    maximo: { type: "number", min: 1, max: 100 },
    indeterminada: { type: "boolean", label: "indeterminada (sem valor)" },
    tom: { type: "select", options: ["destaque", "sucesso", "alerta", "perigo"] },
    tamanho: { type: "select", options: ["sm", "md"] },
    mostrarValor: { type: "boolean" },
    ocultarRotulo: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-md">
      <BarraDeProgresso
        rotulo={a.rotulo}
        valor={a.indeterminada ? undefined : a.valor}
        maximo={a.maximo}
        tom={a.tom as Tom}
        tamanho={a.tamanho as "sm" | "md"}
        mostrarValor={a.mostrarValor}
        ocultarRotulo={a.ocultarRotulo}
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Determinada e indeterminada",
      render: () => (
        <div className="flex w-full max-w-md flex-col gap-6">
          <BarraDeProgresso valor={45} rotulo="Enviando contrato.pdf..." />
          <BarraDeProgresso
            valor={3}
            maximo={5}
            rotulo="Checklist"
            formatarValor={deItens}
            tom="sucesso"
            tamanho="md"
          />
          <BarraDeProgresso rotulo="Analisando o documento..." />
        </div>
      ),
    },
    { name: "Indeterminada", args: { indeterminada: true, rotulo: "Gerando relatório..." } },
    {
      name: "Tons",
      render: () => (
        <div className="flex w-full max-w-md flex-col gap-5">
          <BarraDeProgresso valor={72} rotulo="Meta de vendas" tom="destaque" />
          <BarraDeProgresso valor={100} rotulo="Backup" tom="sucesso" />
          <BarraDeProgresso valor={86} rotulo="Armazenamento usado" tom="alerta" />
          <BarraDeProgresso valor={97} rotulo="Cota de envios" tom="perigo" />
        </div>
      ),
    },
    { name: "Envio simulado", render: () => <EnvioSimulado /> },
  ],
});
