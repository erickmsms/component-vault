import { defineStories } from "@/registry/stories";
import {
  fecharNotificacao,
  HospedeiroDeNotificacoes,
  Notificacao,
  notificar,
  type PosicaoDasNotificacoes,
  type TipoDeNotificacao,
} from "./Notificacoes";

const EXEMPLOS: Record<TipoDeNotificacao, { titulo: string; descricao: string }> = {
  sucesso: { titulo: "Pedido enviado", descricao: "O cliente recebe a confirmação por e-mail." },
  erro: { titulo: "Não foi possível salvar", descricao: "Verifique a conexão e tente de novo." },
  aviso: { titulo: "Estoque baixo", descricao: "Restam 3 unidades do Moedor manual." },
  info: { titulo: "Relatório em preparo", descricao: "Avisamos quando o arquivo estiver pronto." },
};

const ROTULOS: Record<TipoDeNotificacao, string> = { sucesso: "Sucesso", erro: "Erro", aviso: "Aviso", info: "Info" };

const BOTAO =
  "inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-rule bg-page px-4 text-sm font-medium text-ink outline-accent hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2";

function Exemplo({
  posicao,
  contido,
  duracao,
  comDescricao,
  comAcao,
}: {
  posicao: PosicaoDasNotificacoes;
  contido: boolean;
  duracao: number;
  comDescricao: boolean;
  comAcao: boolean;
}) {
  const disparar = (tipo: TipoDeNotificacao) =>
    notificar({
      tipo,
      titulo: EXEMPLOS[tipo].titulo,
      descricao: comDescricao ? EXEMPLOS[tipo].descricao : undefined,
      duracao,
      acao: comAcao ? { rotulo: "Desfazer", aoClicar: () => notificar.info("Ação desfeita") } : undefined,
    });

  return (
    <div
      className={
        contido ? "relative min-h-96 w-full max-w-3xl overflow-hidden rounded-2xl border border-dashed border-rule" : "w-full"
      }
    >
      <div className="flex flex-wrap justify-center gap-2 p-5">
        {(Object.keys(EXEMPLOS) as TipoDeNotificacao[]).map((tipo) => (
          <button key={tipo} type="button" className={BOTAO} onClick={() => disparar(tipo)}>
            {ROTULOS[tipo]}
          </button>
        ))}
        <button type="button" className={BOTAO} onClick={() => fecharNotificacao()}>
          Fechar todas
        </button>
      </div>
      <HospedeiroDeNotificacoes posicao={posicao} contido={contido} />
    </div>
  );
}

/** Repetir o id troca a notificação no lugar: útil para "salvando" → "salvo". */
function ExemploPeloId() {
  const salvar = () => {
    notificar({ id: "salvar", tipo: "info", titulo: "Salvando alterações...", duracao: 0 });
    window.setTimeout(
      () => notificar({ id: "salvar", tipo: "sucesso", titulo: "Alterações salvas", descricao: "Há 2 segundos." }),
      1500,
    );
  };
  return (
    <div className="relative min-h-80 w-full max-w-3xl overflow-hidden rounded-2xl border border-dashed border-rule">
      <div className="flex justify-center p-5">
        <button type="button" className={BOTAO} onClick={salvar}>
          Salvar
        </button>
      </div>
      <HospedeiroDeNotificacoes contido posicao="inferior-centro" />
    </div>
  );
}

export default defineStories({
  args: {
    posicao: "inferior-direita",
    contido: true,
    duracao: 5000,
    comDescricao: true,
    comAcao: false,
  },
  controls: {
    posicao: {
      type: "select",
      options: [
        "superior-esquerda",
        "superior-centro",
        "superior-direita",
        "inferior-esquerda",
        "inferior-centro",
        "inferior-direita",
      ],
    },
    contido: { type: "boolean", label: "contido (desligado: fixo na janela)" },
    duracao: { type: "number", label: "duracao (ms, 0 = fixa)", min: 0, max: 15000, step: 500 },
    comDescricao: { type: "boolean", label: "com descrição" },
    comAcao: { type: "boolean", label: "com ação “Desfazer”" },
  },
  render: (a) => <Exemplo {...a} posicao={a.posicao as PosicaoDasNotificacoes} />,
  stories: [
    {
      name: "Tipos",
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Notificacao tipo="sucesso" titulo={EXEMPLOS.sucesso.titulo} descricao={EXEMPLOS.sucesso.descricao} aoFechar={() => {}} />
          <Notificacao
            tipo="erro"
            titulo={EXEMPLOS.erro.titulo}
            acao={{ rotulo: "Tentar de novo", aoClicar: () => {} }}
            aoFechar={() => {}}
          />
          <Notificacao tipo="aviso" titulo={EXEMPLOS.aviso.titulo} aoFechar={() => {}} />
        </div>
      ),
    },
    { name: "Disparar" },
    { name: "Fixa na janela", args: { contido: false } },
    { name: "Fixa até fechar, com ação", args: { duracao: 0, comAcao: true, posicao: "superior-direita" } },
    { name: "Atualizar pelo id", render: () => <ExemploPeloId /> },
  ],
});
