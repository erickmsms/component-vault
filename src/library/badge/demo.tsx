import { Badge } from "./badge";

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>Rascunho</Badge>
      <Badge tone="success">Ativo</Badge>
      <Badge tone="warning">Pendente</Badge>
      <Badge tone="danger">Falhou</Badge>
    </div>
  );
}
