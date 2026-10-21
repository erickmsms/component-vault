import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { ListaDeTarefas, type ItemDaLista } from "./ListaDeTarefas";

const INICIAIS: ItemDaLista[] = [
  { id: "1", texto: "Levantar os números de vendas do trimestre", feito: true },
  { id: "2", texto: "Montar os gráficos do relatório", feito: true },
  { id: "3", texto: "Revisar o texto com a equipe de marketing", feito: false },
  { id: "4", texto: "Enviar para aprovação da diretoria", feito: false },
];

function Exemplo({ reordenavel, editavel, vazia }: { reordenavel: boolean; editavel: boolean; vazia: boolean }) {
  const [itens, setItens] = useState<ItemDaLista[]>(vazia ? [] : INICIAIS);
  return (
    <div className="w-full max-w-xl">
      <ListaDeTarefas itens={itens} aoMudar={setItens} reordenavel={reordenavel} editavel={editavel} rotulo="Etapas do relatório" />
    </div>
  );
}

export default defineStories({
  args: { reordenavel: true, editavel: true, vazia: false },
  controls: {
    reordenavel: { type: "boolean" },
    editavel: { type: "boolean", label: "editavel (adicionar, editar, remover)" },
    vazia: { type: "boolean", label: "começar vazia" },
  },
  render: (a) => <Exemplo key={String(a.vazia)} {...a} />,
  stories: [
    { name: "Checklist" },
    { name: "Só marcar", args: { editavel: false, reordenavel: false } },
    { name: "Vazia", args: { vazia: true } },
  ],
});
