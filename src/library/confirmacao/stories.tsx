import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { CaixaDeConfirmacao, confirmar, HospedeiroDeConfirmacao, type TomDaConfirmacao } from "./Confirmacao";

const BOTAO =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";
const SECUNDARIO = `${BOTAO} border border-rule-strong text-ink hover:bg-surface`;

// Espaço para a caixa aberta caber no preview, que cresce com o conteúdo
const PALCO = "flex min-h-[28rem] w-full flex-col items-center justify-center gap-4";

function Exemplo({
  titulo,
  mensagem,
  rotuloConfirmar,
  rotuloCancelar,
  tom,
}: {
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  rotuloCancelar: string;
  tom: string;
}) {
  const [resposta, setResposta] = useState<string>("Nenhuma resposta ainda.");

  async function pedir() {
    const ok = await confirmar({
      titulo,
      mensagem: mensagem || undefined,
      rotuloConfirmar: rotuloConfirmar || undefined,
      rotuloCancelar: rotuloCancelar || undefined,
      tom: tom as TomDaConfirmacao,
    });
    setResposta(ok ? "confirmar() resolveu true: confirmou." : "confirmar() resolveu false: cancelou.");
  }

  return (
    <div className={PALCO}>
      <HospedeiroDeConfirmacao />
      <button type="button" onClick={pedir} className={SECUNDARIO}>
        Abrir confirmação
      </button>
      <p role="status" className="text-sm text-ink-2">
        {resposta}
      </p>
    </div>
  );
}

type Tarefa = { id: number; nome: string; arquivada: boolean };

const TAREFAS: Tarefa[] = [
  { id: 1, nome: "Revisar proposta comercial", arquivada: false },
  { id: 2, nome: "Atualizar planilha de custos", arquivada: false },
  { id: 3, nome: "Agendar reunião com fornecedor", arquivada: false },
  { id: 4, nome: "Enviar relatório mensal", arquivada: false },
];

function ExemploLista() {
  const [tarefas, setTarefas] = useState(TAREFAS);

  async function arquivar(t: Tarefa) {
    const ok = await confirmar({
      titulo: "Arquivar tarefa?",
      mensagem: `“${t.nome}” sai do quadro, mas continua na busca e pode ser restaurada.`,
      rotuloConfirmar: "Arquivar",
    });
    if (ok) setTarefas((lista) => lista.map((x) => (x.id === t.id ? { ...x, arquivada: true } : x)));
  }

  async function excluir(t: Tarefa) {
    const ok = await confirmar({
      titulo: "Excluir tarefa?",
      mensagem: `“${t.nome}” e os comentários dela serão apagados. Esta ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir",
      tom: "perigo",
    });
    if (ok) setTarefas((lista) => lista.filter((x) => x.id !== t.id));
  }

  return (
    <div className="flex min-h-[28rem] w-full max-w-xl flex-col gap-4">
      <HospedeiroDeConfirmacao />
      <ul className="divide-y divide-rule rounded-2xl border border-rule">
        {tarefas.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <span className={`min-w-0 flex-1 text-sm ${t.arquivada ? "text-muted line-through" : ""}`}>{t.nome}</span>
            {!t.arquivada && (
              <button
                type="button"
                onClick={() => arquivar(t)}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-ink-2 outline-accent hover:bg-surface hover:text-ink focus-visible:outline-2"
              >
                Arquivar
              </button>
            )}
            <button
              type="button"
              onClick={() => excluir(t)}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-critical outline-accent hover:bg-critical/10 focus-visible:outline-2"
            >
              Excluir
            </button>
          </li>
        ))}
        {tarefas.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted">Nenhuma tarefa.</li>}
      </ul>
      <button type="button" onClick={() => setTarefas(TAREFAS)} className="cursor-pointer self-start rounded-sm text-sm text-accent underline-offset-4 outline-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
        Restaurar exemplo
      </button>
    </div>
  );
}

export default defineStories({
  args: {
    titulo: "Descartar alterações?",
    mensagem: "As mudanças feitas desde o último salvamento serão perdidas.",
    rotuloConfirmar: "Descartar",
    rotuloCancelar: "Continuar editando",
    tom: "perigo",
  },
  controls: {
    titulo: { type: "text" },
    mensagem: { type: "text", label: "mensagem (vazio = sem)" },
    rotuloConfirmar: { type: "text", label: "rotuloConfirmar (vazio = padrão)" },
    rotuloCancelar: { type: "text", label: "rotuloCancelar (vazio = padrão)" },
    tom: { type: "select", options: ["padrao", "perigo"] },
  },
  render: (a) => <Exemplo {...a} />,
  stories: [
    {
      // A caixa parada: a miniatura do catálogo mostra o diálogo, e não só um botão
      name: "Caixa (estática)",
      render: () => (
        <div className="flex w-full justify-center">
          <CaixaDeConfirmacao
            estatico
            aberto
            aoResponder={() => {}}
            titulo="Excluir o projeto?"
            mensagem="As 48 tarefas, os comentários e os anexos serão apagados. Esta ação não pode ser desfeita."
            rotuloConfirmar="Excluir projeto"
            tom="perigo"
          />
        </div>
      ),
    },
    { name: "confirmar() (playground)" },
    {
      name: "Tom padrão",
      args: {
        titulo: "Publicar a página?",
        mensagem: "Ela fica visível para todos os visitantes do site.",
        rotuloConfirmar: "Publicar",
        rotuloCancelar: "",
        tom: "padrao",
      },
    },
    { name: "Lista com arquivar e excluir", render: () => <ExemploLista /> },
  ],
});
