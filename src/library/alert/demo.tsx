import { Alert } from "./alert";

export default function AlertDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Alert title="Nova versão disponível">Atualize para ver as mudanças.</Alert>
      <Alert tone="success" title="Alterações salvas" />
      <Alert tone="error" title="Não foi possível enviar">
        Verifique sua conexão e tente de novo.
      </Alert>
    </div>
  );
}
