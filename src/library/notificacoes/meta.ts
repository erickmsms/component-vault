import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "notificacoes",
  name: "Notificações",
  description:
    "Avisos passageiros (toasts) sem dependências: renderize o HospedeiroDeNotificacoes uma vez e chame notificar() ou notificar.sucesso/erro/aviso/info de qualquer lugar. Empilha, pausa com o mouse ou o foco, tem ação e botão de fechar, e anuncia por aria-live.",
  category: "feedback",
  tags: ["toast", "notificação", "aria-live", "sem dependências"],
  source: "acktalabs",
};
