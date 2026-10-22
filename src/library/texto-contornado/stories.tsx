import { defineStories } from "@/registry/stories";
import { TextoContornado } from "./TextoContornado";

export default defineStories({
  args: {
    texto: "Draw Attention",
    corContorno: "#A78BFA",
    espessura: 1.4,
    duracaoTraco: 1.6,
    intervalo: 0.05,
    gatilho: "ciclo",
    preenchimento: "varrer",
    varrerDe: "esquerda",
    estiloTraco: "solido",
    marchando: false,
    inverter: false,
    sombra: false,
  },
  controls: {
    texto: { type: "text" },
    corContorno: { type: "color" },
    espessura: { type: "number", min: 0.5, max: 6, step: 0.1 },
    duracaoTraco: { type: "number", label: "duracaoTraco (s)", min: 0.2, max: 5, step: 0.1 },
    intervalo: { type: "number", label: "intervalo (s)", min: 0, max: 0.5, step: 0.01 },
    gatilho: { type: "select", options: ["montar", "rolagem", "passar", "ciclo"] },
    preenchimento: { type: "select", options: ["varrer", "aparecer", "nenhum"] },
    varrerDe: { type: "select", options: ["esquerda", "direita", "cima", "baixo"] },
    estiloTraco: { type: "select", options: ["solido", "tracejado", "pontilhado"] },
    marchando: { type: "boolean", label: "marchando (tracejado)" },
    inverter: { type: "boolean" },
    sombra: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-3xl">
      <TextoContornado
        key={`${a.gatilho}-${a.preenchimento}-${a.estiloTraco}`}
        texto={a.texto}
        corContorno={a.corContorno}
        espessura={a.espessura}
        duracaoTraco={a.duracaoTraco}
        intervalo={a.intervalo}
        gatilho={a.gatilho as "ciclo"}
        preenchimento={a.preenchimento as "varrer"}
        varrerDe={a.varrerDe as "esquerda"}
        estiloTraco={a.estiloTraco as "solido"}
        marchando={a.marchando}
        inverter={a.inverter}
        sombra={a.sombra}
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    { name: "Tracejado marchando", args: { texto: "Marching", estiloTraco: "tracejado", marchando: true, preenchimento: "nenhum" } },
    { name: "Com sombra, de cima", args: { texto: "Shadow", sombra: true, varrerDe: "cima", corContorno: "#f97316" } },
    { name: "Ao passar o mouse", args: { texto: "Hover me", gatilho: "passar" } },
  ],
});
