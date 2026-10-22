import { defineStories } from "@/registry/stories";
import { TextoDigitado } from "./TextoDigitado";

type EstiloCursor = "caractere" | "barra" | "bloco" | "sublinhado";
type Efeito = "nenhum" | "surgir" | "desfocar" | "subir";
type ModoApagar = "voltar" | "selecionar";

export default defineStories({
  args: {
    frases: "Componentes prontos. / Código aberto. / Copie e cole.",
    velocidade: 50,
    velocidadeApagando: 30,
    pausa: 2000,
    modoApagar: "voltar",
    repetir: true,
    estiloCursor: "caractere",
    cursor: "|",
    mostrarCursor: true,
    esconderCursorDigitando: false,
    cursorDesliza: true,
    efeito: "nenhum",
    erros: 0,
    reverso: false,
  },
  controls: {
    frases: { type: "text", label: "frases (separadas por /)" },
    velocidade: { type: "number", label: "velocidade (ms por letra)", min: 10, max: 300, step: 10 },
    velocidadeApagando: { type: "number", label: "velocidadeApagando (ms)", min: 10, max: 300, step: 10 },
    pausa: { type: "number", label: "pausa (ms)", min: 0, max: 5000, step: 250 },
    modoApagar: { type: "select", options: ["voltar", "selecionar"] },
    repetir: { type: "boolean" },
    estiloCursor: { type: "select", options: ["caractere", "barra", "bloco", "sublinhado"] },
    cursor: { type: "text" },
    mostrarCursor: { type: "boolean" },
    esconderCursorDigitando: { type: "boolean" },
    cursorDesliza: { type: "boolean" },
    efeito: { type: "select", options: ["nenhum", "surgir", "desfocar", "subir"] },
    erros: { type: "number", label: "erros (0 a 1)", min: 0, max: 1, step: 0.1 },
    reverso: { type: "boolean" },
  },
  render: (a) => (
    <TextoDigitado
      frases={a.frases
        .split("/")
        .map((f: string) => f.trim())
        .filter(Boolean)}
      velocidade={a.velocidade}
      velocidadeApagando={a.velocidadeApagando}
      pausa={a.pausa}
      modoApagar={a.modoApagar as ModoApagar}
      repetir={a.repetir}
      estiloCursor={a.estiloCursor as EstiloCursor}
      cursor={a.cursor}
      mostrarCursor={a.mostrarCursor}
      esconderCursorDigitando={a.esconderCursorDigitando}
      cursorDesliza={a.cursorDesliza}
      efeito={a.efeito as Efeito}
      erros={a.erros}
      reverso={a.reverso}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Terminal com erros",
      render: () => (
        <TextoDigitado
          frases={["npm install component-vault", "npm run dev"]}
          prefixo="$ "
          corPrefixo="#16a34a"
          estiloCursor="bloco"
          erros={0.6}
          velocidadeVariavel={{ min: 40, max: 120 }}
          className="font-mono text-xl text-ink"
        />
      ),
    },
    {
      name: "Uma cor por frase, apagando por seleção",
      render: () => (
        <TextoDigitado
          frases={["Rápido.", "Acessível.", "Bonito."]}
          cores={["#e11d48", "#2563eb", "#16a34a"]}
          modoApagar="selecionar"
          estiloCursor="barra"
          efeito="desfocar"
          className="text-5xl font-extrabold"
        />
      ),
    },
  ],
});
