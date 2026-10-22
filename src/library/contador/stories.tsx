import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { NumerosPrincipais } from "@/library/numeros-principais/NumerosPrincipais";
import { Contador } from "./Contador";

type Valores = {
  valor: number;
  de: number;
  duracao: number;
  casas: number;
  prefixo: string;
  sufixo: string;
};

/** Playground com um botão para ver a contagem de novo (a chave remonta o contador). */
function ExemploComRepetir(a: Valores) {
  const [vez, setVez] = useState(0);
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="font-display text-6xl leading-none font-extrabold tracking-[-0.03em] text-accent">
        <Contador key={vez} valor={a.valor} de={a.de} duracao={a.duracao} casas={a.casas} prefixo={a.prefixo} sufixo={a.sufixo} />
      </span>
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
  args: { valor: 25, de: 0, duracao: 1400, casas: 0, prefixo: "", sufixo: "+" },
  controls: {
    valor: { type: "number", step: 1 },
    de: { type: "number", step: 1 },
    duracao: { type: "number", label: "duracao (ms)", min: 0, max: 5000, step: 100 },
    casas: { type: "number", label: "casas decimais", min: 0, max: 3 },
    prefixo: { type: "text" },
    sufixo: { type: "text" },
  },
  render: (a) => <ExemploComRepetir {...a} />,
  stories: [
    { name: "Padrão" },
    {
      name: "Dentro de uma frase",
      render: () => (
        <p className="max-w-md text-lg leading-relaxed text-ink-2">
          Já atendemos <Contador valor={1280} className="font-semibold text-ink" /> clientes, com{" "}
          <Contador valor={98.6} casas={1} sufixo="%" className="font-semibold text-ink" /> dos pedidos entregues no prazo.
        </p>
      ),
    },
    {
      name: "Em Números Principais",
      render: () => (
        <div className="w-full">
          <NumerosPrincipais
            itens={[
              { valor: <Contador valor={48} prefixo="R$ " sufixo=" mil" />, texto: "de receita em outubro." },
              { valor: <Contador valor={1284} />, texto: "pedidos pagos no mês." },
              { valor: <Contador valor={3.2} casas={1} sufixo="%" />, texto: "dos visitantes compraram algo." },
            ]}
          />
        </div>
      ),
    },
    { name: "Contagem regressiva", args: { valor: 0, de: 100, duracao: 2000, sufixo: "%" } },
  ],
});
