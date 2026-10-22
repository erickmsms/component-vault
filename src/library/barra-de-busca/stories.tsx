import { useState } from "react";
import { Campo, type TamanhoDoCampo } from "@/library/campo-de-formulario/Campo";
import { defineStories } from "@/registry/stories";
import { BarraDeBusca } from "./BarraDeBusca";

const PRODUTOS = [
  "Cadeira de escritório",
  "Mesa regulável",
  "Monitor 27 polegadas",
  "Teclado sem fio",
  "Mouse vertical",
  "Suporte para notebook",
];

function ExemploComResultados() {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();
  const achados = PRODUTOS.filter((p) => p.toLowerCase().includes(termo));
  return (
    <div className="w-full max-w-sm">
      <BarraDeBusca
        aria-label="Buscar produtos"
        aria-controls="produtos-encontrados"
        value={busca}
        onChange={setBusca}
        placeholder="Buscar produtos..."
      />
      <p role="status" className="mt-3 text-xs text-muted">
        {achados.length === PRODUTOS.length
          ? `${PRODUTOS.length} produtos`
          : `${achados.length} de ${PRODUTOS.length} produtos`}
      </p>
      <ul id="produtos-encontrados" className="mt-2 divide-y divide-rule text-sm">
        {achados.map((p) => (
          <li key={p} className="py-2">
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default defineStories({
  args: { placeholder: "Buscar por nome, tema, projeto...", tamanho: "md", atalho: true, desativado: false },
  controls: {
    placeholder: { type: "text" },
    tamanho: { type: "select", options: ["sm", "md", "lg"] },
    atalho: { type: "boolean", label: "atalho (Ctrl+K)" },
    desativado: { type: "boolean", label: "disabled" },
  },
  render: (a) => (
    <div className="w-full max-w-xl">
      <BarraDeBusca
        aria-label="Buscar"
        placeholder={a.placeholder as string}
        tamanho={a.tamanho as TamanhoDoCampo}
        atalho={a.atalho as boolean}
        disabled={a.desativado as boolean}
      />
    </div>
  ),
  stories: [
    { name: "Barra de busca" },
    { name: "Filtrando uma lista", render: () => <ExemploComResultados /> },
    {
      name: "Dentro de um Campo",
      render: () => (
        <div className="w-full max-w-sm">
          <Campo rotulo="Cliente" ajuda="Busque pelo nome ou CNPJ.">
            <BarraDeBusca placeholder="Buscar cliente..." />
          </Campo>
        </div>
      ),
    },
    {
      name: "Tamanhos",
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-4">
          {(["sm", "md", "lg"] as const).map((t) => (
            <BarraDeBusca key={t} aria-label={`Busca (${t})`} tamanho={t} valorInicial="relatório" />
          ))}
        </div>
      ),
    },
  ],
});
