import { defineStories } from "@/registry/stories";
import { GradeNumerada } from "./GradeNumerada";

const DIFERENCIAIS = [
  { titulo: "Atendimento dedicado", texto: "Uma pessoa da nossa equipe acompanha a sua conta do começo ao fim, sem fila de chamados." },
  { titulo: "Relatórios mensais", texto: "Todo mês, um resumo claro do que foi feito, do que mudou e dos próximos passos." },
  { titulo: "Integração com o seu sistema", texto: "Conectamos aos programas que você já usa, sem retrabalho nem planilhas paralelas." },
  { titulo: "Implantação em duas semanas", texto: "Do contrato ao uso diário em poucos dias, com treinamento para toda a equipe." },
  { titulo: "Dados protegidos", texto: "Criptografia, cópias de segurança diárias e acesso controlado por pessoa." },
  { titulo: "Suporte em português", texto: "Chat e telefone em dias úteis, com resposta em até duas horas." },
];

export default defineStories({
  args: { titulo: "Por que trabalhar com a gente", quantidade: 4, alternada: false },
  controls: {
    titulo: { type: "text", label: "titulo (vazio = sem)" },
    quantidade: { type: "number", label: "itens (quantidade)", min: 1, max: 6 },
    alternada: { type: "boolean" },
  },
  render: (a) => (
    <GradeNumerada
      titulo={a.titulo || undefined}
      itens={DIFERENCIAIS.slice(0, a.quantidade)}
      alternada={a.alternada}
    />
  ),
  stories: [
    { name: "Quatro itens" },
    { name: "Três itens, alternada", args: { quantidade: 3, alternada: true } },
    { name: "Dois itens", args: { titulo: "O que está incluído", quantidade: 2 } },
    { name: "Seis itens, sem título", args: { titulo: "", quantidade: 6 } },
    {
      name: "Seções em sequência",
      render: () => (
        <div className="w-full">
          <GradeNumerada titulo="Para a sua equipe" itens={DIFERENCIAIS.slice(0, 3)} />
          <GradeNumerada titulo="Para a sua empresa" itens={DIFERENCIAIS.slice(3, 6)} alternada />
        </div>
      ),
    },
  ],
});
