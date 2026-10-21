import { defineStories } from "@/registry/stories";
import { PassosNumerados } from "./PassosNumerados";

const ETAPAS = [
  { titulo: "Conversa inicial", texto: "Entendemos o momento da empresa, os objetivos e o que já foi tentado." },
  { titulo: "Diagnóstico", texto: "Levantamos os números e os processos para achar onde está o maior ganho." },
  { titulo: "Plano de ação", texto: "Um plano com prioridades, prazos e responsáveis, revisado junto com você." },
  { titulo: "Acompanhamento", texto: "Encontros quinzenais para medir resultados e ajustar o que for preciso." },
  { titulo: "Revisão", texto: "No fim do ciclo, comparamos o antes e o depois e definimos os próximos passos." },
  { titulo: "Renovação", texto: "Se fizer sentido, um novo ciclo começa a partir do que foi aprendido." },
];

export default defineStories({
  args: { titulo: "Como funciona", quantidade: 4, alternada: false },
  controls: {
    titulo: { type: "text", label: "titulo (vazio = sem)" },
    quantidade: { type: "number", label: "passos (quantidade)", min: 2, max: 6 },
    alternada: { type: "boolean" },
  },
  render: (a) => (
    <PassosNumerados titulo={a.titulo || undefined} passos={ETAPAS.slice(0, a.quantidade)} alternada={a.alternada} />
  ),
  stories: [
    { name: "Quatro passos" },
    { name: "Três passos", args: { titulo: "Em três passos", quantidade: 3 } },
    { name: "Cinco passos, alternada", args: { quantidade: 5, alternada: true } },
    { name: "Seis passos (duas linhas)", args: { titulo: "O ciclo completo", quantidade: 6 } },
  ],
});
