import { defineStories } from "@/registry/stories";
import { TextoDigitado } from "./TextoDigitado";

export default defineStories({
  args: {
    frases: "Componentes prontos. / Código aberto. / Copie e cole.",
    velocidade: 50,
    velocidadeApagando: 30,
    pausa: 2000,
    repetir: true,
    cursor: "|",
    mostrarCursor: true,
    esconderCursorDigitando: false,
  },
  controls: {
    frases: { type: "text", label: "frases (separadas por /)" },
    velocidade: { type: "number", label: "velocidade (ms por letra)", min: 10, max: 300, step: 10 },
    velocidadeApagando: { type: "number", label: "velocidadeApagando (ms)", min: 10, max: 300, step: 10 },
    pausa: { type: "number", label: "pausa (ms)", min: 0, max: 5000, step: 250 },
    repetir: { type: "boolean" },
    cursor: { type: "text" },
    mostrarCursor: { type: "boolean" },
    esconderCursorDigitando: { type: "boolean" },
  },
  render: (a) => (
    <TextoDigitado
      frases={a.frases.split("/").map((f: string) => f.trim()).filter(Boolean)}
      velocidade={a.velocidade}
      velocidadeApagando={a.velocidadeApagando}
      pausa={a.pausa}
      repetir={a.repetir}
      cursor={a.cursor}
      mostrarCursor={a.mostrarCursor}
      esconderCursorDigitando={a.esconderCursorDigitando}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Uma cor por frase",
      render: () => (
        <TextoDigitado
          frases={["Rápido.", "Acessível.", "Bonito."]}
          cores={["#e11d48", "#2563eb", "#16a34a"]}
          cursor="_"
          className="text-5xl font-extrabold"
        />
      ),
    },
    {
      name: "Sem repetir",
      render: () => (
        <TextoDigitado frases={["Olá!", "Bem-vindo à biblioteca."]} repetir={false} className="text-2xl text-ink" />
      ),
    },
  ],
});
