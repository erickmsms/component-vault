"use client";

import { useRef } from "react";
import { defineStories } from "@/registry/stories";
import {
  TextoRotativo,
  type ControleDoTextoRotativo,
  type EfeitoDeRotacao,
  type OrigemDoEscalonamento,
} from "./TextoRotativo";

const PALAVRAS = ["rápido", "bonito", "acessível", "seu"];

function ComBotoes() {
  const ref = useRef<ControleDoTextoRotativo>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <TextoRotativo ref={ref} textos={PALAVRAS} automatico={false} efeito="virar" className="text-4xl font-bold text-ink" />
      <div className="flex gap-2">
        <button className="rounded border border-ink/20 px-3 py-1 text-sm" onClick={() => ref.current?.anterior()}>
          Anterior
        </button>
        <button className="rounded border border-ink/20 px-3 py-1 text-sm" onClick={() => ref.current?.proximo()}>
          Próximo
        </button>
      </div>
    </div>
  );
}

export default defineStories({
  args: {
    efeito: "deslizar",
    direcao: "cima",
    destaque: true,
    corDoDestaque: "#a855f7",
    intervalo: 2000,
    escalonamento: 0.025,
    origemDoEscalonamento: "ultimo",
    desfoque: 0,
    dividirPor: "letras",
    pausarAoPassar: false,
  },
  controls: {
    efeito: { type: "select", options: ["deslizar", "virar", "desfocar", "escala", "cair"] },
    direcao: { type: "select", options: ["cima", "baixo"] },
    destaque: { type: "boolean" },
    corDoDestaque: { type: "color" },
    intervalo: { type: "number", label: "intervalo (ms)", min: 800, max: 5000, step: 100 },
    escalonamento: { type: "number", label: "escalonamento (s)", min: 0, max: 0.1, step: 0.005 },
    origemDoEscalonamento: { type: "select", options: ["primeiro", "ultimo", "centro", "aleatorio"] },
    desfoque: { type: "number", label: "desfoque (px)", min: 0, max: 20, step: 1 },
    dividirPor: { type: "select", options: ["letras", "palavras"] },
    pausarAoPassar: { type: "boolean" },
  },
  render: (a) => (
    <div className="flex items-center gap-2 text-4xl font-bold text-ink">
      <span>Fica</span>
      <TextoRotativo
        textos={PALAVRAS}
        efeito={a.efeito as EfeitoDeRotacao}
        direcao={a.direcao as "cima" | "baixo"}
        destaque={a.destaque}
        corDoDestaque={a.corDoDestaque}
        intervalo={a.intervalo}
        escalonamento={a.escalonamento}
        origemDoEscalonamento={a.origemDoEscalonamento as OrigemDoEscalonamento}
        desfoque={a.desfoque}
        dividirPor={a.dividirPor}
        pausarAoPassar={a.pausarAoPassar}
        classeDaPalavra="overflow-hidden pb-1"
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Todos os efeitos",
      render: () => (
        <div className="flex flex-col gap-4 text-3xl font-bold text-ink">
          {(["deslizar", "virar", "desfocar", "escala", "cair"] as const).map((e) => (
            <div key={e} className="flex items-center gap-3">
              <span className="w-32 text-sm font-normal text-muted">{e}</span>
              <TextoRotativo textos={["Design", "Código", "Dados"]} efeito={e} escalonamento={0.03} />
            </div>
          ))}
        </div>
      ),
    },
    { name: "Controlado por botões", render: () => <ComBotoes /> },
  ],
});
