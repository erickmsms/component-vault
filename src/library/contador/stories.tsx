import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { Contador } from "./Contador";

type Valores = {
  valor: number;
  de: number;
  duracao: number;
  casas: number;
  prefixo: string;
  sufixo: string;
  rotulo: string;
};

/** Playground com um botão para ver a contagem de novo (a chave remonta o contador). */
function ExemploComRepetir(a: Valores) {
  const [vez, setVez] = useState(0);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-6">
      <Contador
        key={vez}
        valor={a.valor}
        de={a.de}
        duracao={a.duracao}
        casas={a.casas}
        prefixo={a.prefixo}
        sufixo={a.sufixo}
        rotulo={a.rotulo || undefined}
      />
      <button
        type="button"
        onClick={() => setVez((v) => v + 1)}
        className="rounded-full border border-rule-strong px-4 py-2 text-sm font-medium text-ink outline-accent hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Contar de novo
      </button>
    </div>
  );
}

export default defineStories({
  args: {
    valor: 25,
    de: 0,
    duracao: 1400,
    casas: 0,
    prefixo: "",
    sufixo: "+",
    rotulo: "anos de experiência atendendo empresas de todos os tamanhos.",
  },
  controls: {
    valor: { type: "number", step: 1 },
    de: { type: "number", step: 1 },
    duracao: { type: "number", label: "duracao (ms)", min: 0, max: 5000, step: 100 },
    casas: { type: "number", label: "casas decimais", min: 0, max: 3 },
    prefixo: { type: "text" },
    sufixo: { type: "text" },
    rotulo: { type: "text", label: "rotulo (vazio = sem)" },
  },
  render: (a) => <ExemploComRepetir {...a} />,
  stories: [
    {
      name: "Números lado a lado",
      render: () => (
        <div className="grid w-full max-w-3xl gap-10 sm:grid-cols-3">
          <Contador valor={25} sufixo="+" rotulo="anos no mercado" rotuloAcessivel="mais de 25 anos" />
          <Contador valor={1280} rotulo="clientes atendidos" />
          <Contador valor={98.6} casas={1} sufixo="%" rotulo="de pedidos entregues no prazo" />
        </div>
      ),
    },
    { name: "Playground" },
    {
      name: "Valor em reais",
      args: { valor: 48.5, casas: 1, prefixo: "R$ ", sufixo: " mi", rotulo: "faturados no último trimestre" },
    },
    {
      name: "Contagem regressiva",
      args: { valor: 0, de: 100, duracao: 2000, sufixo: "%", rotulo: "de espaço livre restante" },
    },
  ],
});
