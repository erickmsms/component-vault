import { Aviso } from "./Aviso";

export default function AvisoDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Aviso>Os dados são atualizados todo dia às 6h.</Aviso>
      <Aviso tipo="sucesso">Alterações salvas.</Aviso>
      <Aviso tipo="alerta">Selecione ao menos um filtro para ver o relatório.</Aviso>
      <Aviso tipo="erro" rotulo="Falha ao carregar">Não foi possível ler o arquivo de dados.</Aviso>
    </div>
  );
}
