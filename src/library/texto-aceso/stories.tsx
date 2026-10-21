import { defineStories } from "@/registry/stories";
import { TextoAceso } from "./TextoAceso";

const PARAGRAFOS = [
  "Começamos como uma pequena oficina de bairro e hoje atendemos empresas em todo o país, sem perder o cuidado com cada pedido.",
  "Nossa equipe acompanha cada projeto do primeiro esboço à entrega, com prazos claros e uma pessoa responsável do início ao fim.",
];

export default defineStories({
  args: {
    paragrafos: 2,
    opacidadeApagada: 0.15,
    inicio: 0.78,
    fim: 0.62,
    fixarProgresso: false,
    progresso: 0.45,
  },
  controls: {
    paragrafos: { type: "number", label: "parágrafos (quantidade)", min: 1, max: 2 },
    opacidadeApagada: { type: "number", min: 0, max: 1, step: 0.05 },
    inicio: { type: "number", label: "inicio (fração da tela)", min: 0, max: 1, step: 0.02 },
    fim: { type: "number", label: "fim (fração da tela)", min: 0, max: 1, step: 0.02 },
    fixarProgresso: { type: "boolean", label: "fixar progresso (ignora a rolagem)" },
    progresso: { type: "number", label: "progresso (com fixar)", min: 0, max: 1, step: 0.05 },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      {!a.fixarProgresso && <p className="pb-[60vh] text-center text-sm text-muted">Role para baixo dentro do preview ↓</p>}
      <TextoAceso
        paragrafos={PARAGRAFOS.slice(0, a.paragrafos)}
        opacidadeApagada={a.opacidadeApagada}
        inicio={a.inicio}
        fim={a.fim}
        progresso={a.fixarProgresso ? a.progresso : undefined}
      />
      {!a.fixarProgresso && <div className="h-[70vh]" />}
    </div>
  ),
  stories: [
    { name: "Parado no meio", args: { fixarProgresso: true, progresso: 0.45 } },
    { name: "Ao rolar (playground)" },
    {
      name: "Texto menor e mais apagado",
      render: () => (
        <div className="w-full max-w-xl">
          <p className="pb-[60vh] text-center text-sm text-muted">Role para baixo dentro do preview ↓</p>
          <TextoAceso
            paragrafos={[PARAGRAFOS[1]]}
            opacidadeApagada={0.08}
            className="text-lg leading-relaxed text-ink-2"
          />
          <div className="h-[70vh]" />
        </div>
      ),
    },
  ],
});
