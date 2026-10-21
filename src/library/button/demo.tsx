import { Button } from "./button";

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button>Primário</Button>
      <Button variant="secondary">Secundário</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="sm" disabled>
        Desabilitado
      </Button>
    </div>
  );
}
