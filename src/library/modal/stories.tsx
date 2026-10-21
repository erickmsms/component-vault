import { useId, useRef, useState, type FormEvent } from "react";
import { AreaDeTexto, Campo, Entrada, Selecao } from "@/library/campo-de-formulario/Campo";
import { defineStories } from "@/registry/stories";
import { Modal, type TamanhoDoModal } from "./Modal";

const BOTAO =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const PRIMARIO = `${BOTAO} bg-accent text-page hover:bg-accent/90`;
const SECUNDARIO = `${BOTAO} border border-rule-strong text-ink hover:bg-surface`;
const PERIGO = `${BOTAO} bg-critical text-page hover:bg-critical/90`;

// Espaço para o modal aberto caber no preview, que cresce com o conteúdo
const PALCO = "flex min-h-[34rem] w-full flex-col items-center justify-center gap-3";

function Resumo() {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl bg-surface p-5 text-sm">
      <dt className="text-muted">Período</dt>
      <dd>1 a 31 de março</dd>
      <dt className="text-muted">Páginas</dt>
      <dd>12</dd>
      <dt className="text-muted">Destinatários</dt>
      <dd>Equipe comercial (8 pessoas)</dd>
    </dl>
  );
}

function Exemplo({
  titulo,
  chapeu,
  descricao,
  tamanho,
  fecharAoClicarFora,
  fecharDesativado,
  mostrarFechar,
  estatico,
}: {
  titulo: string;
  chapeu: string;
  descricao: string;
  tamanho: string;
  fecharAoClicarFora: boolean;
  fecharDesativado: boolean;
  mostrarFechar: boolean;
  estatico: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);
  const modal = (
    <Modal
      estatico={estatico}
      aberto={aberto}
      aoFechar={fechar}
      titulo={titulo}
      chapeu={chapeu || undefined}
      descricao={descricao || undefined}
      tamanho={tamanho as TamanhoDoModal}
      fecharAoClicarFora={fecharAoClicarFora}
      fecharDesativado={fecharDesativado}
      mostrarFechar={mostrarFechar}
      rodape={
        <>
          <button type="button" onClick={fechar} className={SECUNDARIO}>
            Cancelar
          </button>
          <button type="button" onClick={fechar} className={PRIMARIO}>
            Publicar
          </button>
        </>
      }
    >
      <Resumo />
    </Modal>
  );

  if (estatico) return <div className="flex w-full justify-center">{modal}</div>;
  return (
    <div className={PALCO}>
      <button type="button" onClick={() => setAberto(true)} className={PRIMARIO}>
        Publicar relatório
      </button>
      {modal}
    </div>
  );
}

const PAPEIS = [
  { valor: "leitura", rotulo: "Só leitura" },
  { valor: "edicao", rotulo: "Pode editar" },
  { valor: "admin", rotulo: "Administra a equipe" },
];

function ExemploFormulario() {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState("");
  const idForm = useId();

  const erros: { nome?: string; email?: string; papel?: string } = tentou
    ? {
        nome: nome.trim() ? undefined : "Informe o nome.",
        email: /^\S+@\S+\.\S+$/.test(email) ? undefined : "Informe um e-mail válido.",
        papel: papel ? undefined : "Escolha o que a pessoa pode fazer.",
      }
    : {};

  function abrir() {
    setNome("");
    setEmail("");
    setPapel("");
    setMensagem("");
    setTentou(false);
    setAberto(true);
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTentou(true);
    const form = e.currentTarget;
    if (!nome.trim() || !/^\S+@\S+\.\S+$/.test(email) || !papel) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    // Enquanto "salva", nenhuma saída fecha o modal (Esc, clique fora e × ficam bloqueados)
    setSalvando(true);
    window.setTimeout(() => {
      setSalvando(false);
      setAberto(false);
      setEnviado(`Convite enviado para ${email}.`);
    }, 1500);
  }

  return (
    <div className={PALCO}>
      <button type="button" onClick={abrir} className={PRIMARIO}>
        Convidar pessoa
      </button>
      <p role="status" className="min-h-5 text-sm text-ink-2">
        {enviado}
      </p>
      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        chapeu="Equipe de vendas"
        titulo="Convidar pessoa"
        descricao="A pessoa recebe um e-mail com o link de acesso, válido por 7 dias."
        fecharAoClicarFora={false}
        fecharDesativado={salvando}
        rodape={
          <>
            <button type="button" onClick={() => setAberto(false)} disabled={salvando} className={SECUNDARIO}>
              Cancelar
            </button>
            <button type="submit" form={idForm} disabled={salvando} className={PRIMARIO}>
              {salvando ? "Enviando..." : "Enviar convite"}
            </button>
          </>
        }
      >
        <form id={idForm} onSubmit={enviar} noValidate className="space-y-4">
          <Campo rotulo="Nome" erro={erros.nome} obrigatorio>
            <Entrada value={nome} onChange={setNome} autoComplete="name" placeholder="Nome completo" />
          </Campo>
          <Campo rotulo="E-mail" erro={erros.email} obrigatorio>
            <Entrada type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="pessoa@empresa.com" />
          </Campo>
          <Campo rotulo="Permissão" erro={erros.papel} obrigatorio>
            <Selecao value={papel} onChange={setPapel} opcoes={PAPEIS} vazio="Selecione..." />
          </Campo>
          <Campo rotulo="Mensagem" ajuda="Opcional. Vai junto no e-mail do convite.">
            <AreaDeTexto value={mensagem} onChange={setMensagem} rows={3} />
          </Campo>
        </form>
      </Modal>
    </div>
  );
}

const CLAUSULAS = [
  ["Uso da conta", "A conta é pessoal. Cada pessoa da equipe deve ter o próprio acesso, e as senhas não devem ser compartilhadas."],
  ["Dados enviados", "Os arquivos e dados que você envia continuam sendo seus. Usamos essas informações só para prestar o serviço contratado."],
  ["Disponibilidade", "Buscamos manter o serviço no ar o tempo todo, mas manutenções programadas são avisadas com 48 horas de antecedência."],
  ["Pagamentos", "As cobranças são mensais e antecipadas. Atrasos acima de 15 dias podem suspender o acesso até a regularização."],
  ["Cancelamento", "Você pode cancelar quando quiser, pelo painel. Os dados ficam disponíveis para exportação por 30 dias."],
  ["Suporte", "O suporte atende em dias úteis, das 9h às 18h, pelo chat e pelo e-mail informado no painel."],
  ["Alterações", "Mudanças nestes termos são comunicadas por e-mail com pelo menos 30 dias de antecedência."],
  ["Foro", "Fica eleito o foro da comarca da sede da empresa para resolver qualquer questão sobre estes termos."],
];

function ExemploLongo() {
  const [aberto, setAberto] = useState(false);
  const [aceitou, setAceitou] = useState(false);
  return (
    <div className={PALCO}>
      <button type="button" onClick={() => setAberto(true)} className={SECUNDARIO}>
        Ler os termos de uso
      </button>
      <p className="text-sm text-ink-2">{aceitou ? "Termos aceitos." : "Termos ainda não aceitos."}</p>
      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        chapeu="Versão 3.2"
        titulo="Termos de uso"
        descricao="Role para ler tudo: o cabeçalho e os botões ficam fixos, só o texto rola."
        tamanho="lg"
        rodape={
          <>
            <button type="button" onClick={() => setAberto(false)} className={SECUNDARIO}>
              Agora não
            </button>
            <button
              type="button"
              onClick={() => {
                setAceitou(true);
                setAberto(false);
              }}
              className={PRIMARIO}
            >
              Aceitar
            </button>
          </>
        }
      >
        <ol className="space-y-6">
          {[...CLAUSULAS, ...CLAUSULAS].map(([titulo, texto], i) => (
            <li key={i}>
              <h3 className="font-medium text-ink">
                {i + 1}. {titulo}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{texto}</p>
            </li>
          ))}
        </ol>
      </Modal>
    </div>
  );
}

function ExemploPerigo() {
  const [aberto, setAberto] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const cancelar = useRef<HTMLButtonElement>(null);
  return (
    <div className={PALCO}>
      <button type="button" onClick={() => setAberto(true)} disabled={excluido} className={PERIGO}>
        Excluir projeto
      </button>
      <p className="text-sm text-ink-2">{excluido ? "Projeto excluído." : "Projeto “Site novo”: 48 tarefas."}</p>
      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        alerta
        mostrarFechar={false}
        tamanho="sm"
        // Em ação destrutiva o foco começa em Cancelar: um Enter por reflexo não apaga nada
        focoInicial={cancelar}
        icone={
          <span className="grid size-10 place-items-center rounded-full bg-critical/10 text-critical">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2.5 20h19L12 3z" />
              <path d="M12 10v4" />
              <path d="M12 17.5h.01" />
            </svg>
          </span>
        }
        titulo="Excluir o projeto?"
        descricao="As 48 tarefas, os comentários e os anexos serão apagados. Esta ação não pode ser desfeita."
        rodape={
          <>
            <button ref={cancelar} type="button" onClick={() => setAberto(false)} className={SECUNDARIO}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setExcluido(true);
                setAberto(false);
              }}
              className={PERIGO}
            >
              Excluir projeto
            </button>
          </>
        }
      />
    </div>
  );
}

export default defineStories({
  args: {
    titulo: "Publicar relatório",
    chapeu: "Relatório mensal",
    descricao: "O relatório fica visível para toda a equipe e um aviso é enviado por e-mail.",
    tamanho: "md",
    fecharAoClicarFora: true,
    fecharDesativado: false,
    mostrarFechar: true,
    estatico: false,
  },
  controls: {
    titulo: { type: "text" },
    chapeu: { type: "text", label: "chapeu (vazio = sem)" },
    descricao: { type: "text", label: "descricao (vazio = sem)" },
    tamanho: { type: "select", options: ["sm", "md", "lg", "xl"] },
    fecharAoClicarFora: { type: "boolean" },
    fecharDesativado: { type: "boolean", label: "fecharDesativado (bloqueia Esc, clique fora e ×)" },
    mostrarFechar: { type: "boolean", label: "mostrarFechar (botão ×)" },
    estatico: { type: "boolean", label: "estatico (só o painel, sem abrir)" },
  },
  render: (a) => <Exemplo {...a} />,
  stories: [
    // Painel parado: a miniatura do catálogo mostra o modal em si, e não só um botão
    { name: "Painel (estático)", args: { estatico: true } },
    { name: "Simples" },
    { name: "Com formulário", render: () => <ExemploFormulario /> },
    { name: "Conteúdo longo", render: () => <ExemploLongo /> },
    { name: "Confirmação destrutiva", render: () => <ExemploPerigo /> },
  ],
});
