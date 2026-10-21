import { defineStories } from "@/registry/stories";
import { Aviso, type TipoDeAviso } from "./Aviso";

export default defineStories({
  args: { tipo: "info", rotulo: "", texto: "Os dados são atualizados todo dia às 6h." },
  controls: {
    tipo: { type: "select", options: ["info", "sucesso", "alerta", "erro"] },
    rotulo: { type: "text", label: "rotulo (vazio = padrão do tipo)" },
    texto: { type: "text", label: "children" },
  },
  render: (a) => (
    <div className="w-full max-w-xl">
      <Aviso tipo={a.tipo as TipoDeAviso} rotulo={a.rotulo || undefined}>
        {a.texto}
      </Aviso>
    </div>
  ),
  stories: [
    {
      name: "Todos os tipos",
      render: () => (
        <div className="flex w-full max-w-xl flex-col gap-3">
          <Aviso>Os dados são atualizados todo dia às 6h.</Aviso>
          <Aviso tipo="sucesso">Alterações salvas.</Aviso>
          <Aviso tipo="alerta">Selecione ao menos um filtro para ver o relatório.</Aviso>
          <Aviso tipo="erro">Não foi possível ler o arquivo de dados.</Aviso>
        </div>
      ),
    },
    { name: "Info" },
    { name: "Sucesso", args: { tipo: "sucesso", texto: "Alterações salvas." } },
    { name: "Alerta", args: { tipo: "alerta", texto: "Selecione ao menos um filtro para ver o relatório." } },
    {
      name: "Erro com rótulo próprio",
      args: { tipo: "erro", rotulo: "Falha ao carregar", texto: "Não foi possível ler o arquivo de dados." },
    },
  ],
});
