import { useState, type FormEvent, type ReactNode } from "react";
import { Aviso } from "@/library/aviso/Aviso";
import { defineStories } from "@/registry/stories";
import {
  AreaDeTexto,
  Campo,
  Entrada,
  EntradaDeBusca,
  EntradaDeSenha,
  Selecao,
  type TamanhoDoCampo,
} from "./Campo";

function Traco({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const ICONES = {
  pessoa: (
    <Traco>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Traco>
  ),
  email: (
    <Traco>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </Traco>
  ),
  telefone: (
    <Traco>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2.1Z" />
    </Traco>
  ),
  empresa: (
    <Traco>
      <path d="M4 21V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15" />
      <path d="M15 10h3a2 2 0 0 1 2 2v9" />
      <path d="M2 21h20M8 8h3M8 12h3M8 16h3" />
    </Traco>
  ),
  local: (
    <Traco>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Traco>
  ),
  cadeado: (
    <Traco>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Traco>
  ),
  balao: (
    <Traco>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </Traco>
  ),
};

const BOTAO =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-accent px-7 text-sm font-medium text-page outline-accent transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2";

const ASSUNTOS = [
  { valor: "orcamento", rotulo: "Pedir orçamento" },
  { valor: "suporte", rotulo: "Suporte técnico" },
  { valor: "parceria", rotulo: "Parcerias" },
  { valor: "outro", rotulo: "Outro assunto" },
];

type Contato = { nome: string; email: string; telefone: string; cnpj: string; assunto: string; mensagem: string };

const VAZIO: Contato = { nome: "", email: "", telefone: "", cnpj: "", assunto: "", mensagem: "" };

function validar(c: Contato): Partial<Record<keyof Contato, string>> {
  return {
    nome: c.nome.trim().length < 3 ? "Informe o nome completo." : undefined,
    email: /^\S+@\S+\.\S+$/.test(c.email) ? undefined : "Informe um e-mail válido, como voce@empresa.com.",
    telefone: c.telefone.length < 14 ? "Informe o telefone com DDD." : undefined,
    cnpj: c.cnpj && c.cnpj.length < 18 ? "O CNPJ tem 14 dígitos." : undefined,
    assunto: c.assunto ? undefined : "Escolha um assunto.",
    mensagem: c.mensagem.trim().length < 10 ? "Escreva ao menos 10 caracteres." : undefined,
  };
}

function FormularioDeContato() {
  const [dados, setDados] = useState<Contato>(VAZIO);
  const [tentou, setTentou] = useState(false);
  const [enviado, setEnviado] = useState(false);
  // Os erros aparecem depois da primeira tentativa de envio e somem à medida que a pessoa corrige
  const erros = tentou ? validar(dados) : {};
  const mudar = (campo: keyof Contato) => (valor: string) => setDados((d) => ({ ...d, [campo]: valor }));

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTentou(true);
    const form = e.currentTarget;
    if (Object.values(validar(dados)).some(Boolean)) {
      setEnviado(false);
      // Leva o foco ao primeiro campo com erro, depois que as mensagens aparecem
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setEnviado(true);
    setDados(VAZIO);
    setTentou(false);
  }

  return (
    <form onSubmit={enviar} noValidate className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <Campo rotulo="Nome" icone={ICONES.pessoa} erro={erros.nome} obrigatorio>
        <Entrada value={dados.nome} onChange={mudar("nome")} autoComplete="name" placeholder="Seu nome completo" />
      </Campo>
      <Campo rotulo="E-mail" icone={ICONES.email} erro={erros.email} obrigatorio>
        <Entrada
          type="email"
          inputMode="email"
          value={dados.email}
          onChange={mudar("email")}
          autoComplete="email"
          placeholder="voce@empresa.com"
        />
      </Campo>
      <Campo rotulo="Telefone" icone={ICONES.telefone} erro={erros.telefone} obrigatorio>
        <Entrada
          mascara="(00) 00000-0000"
          inputMode="tel"
          value={dados.telefone}
          onChange={mudar("telefone")}
          autoComplete="tel"
          placeholder="(00) 00000-0000"
        />
      </Campo>
      <Campo rotulo="CNPJ" icone={ICONES.empresa} erro={erros.cnpj} ajuda="Opcional.">
        <Entrada
          mascara="00.000.000/0000-00"
          inputMode="numeric"
          value={dados.cnpj}
          onChange={mudar("cnpj")}
          placeholder="00.000.000/0000-00"
        />
      </Campo>
      <div className="sm:col-span-2">
        <Campo rotulo="Assunto" icone={ICONES.balao} erro={erros.assunto} obrigatorio>
          <Selecao value={dados.assunto} onChange={mudar("assunto")} opcoes={ASSUNTOS} vazio="Selecione..." />
        </Campo>
      </div>
      <div className="sm:col-span-2">
        <Campo rotulo="Mensagem" erro={erros.mensagem} obrigatorio>
          <AreaDeTexto value={dados.mensagem} onChange={mudar("mensagem")} placeholder="Conte como podemos ajudar" />
        </Campo>
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" className={BOTAO}>
          Enviar mensagem
        </button>
        {enviado && <Aviso tipo="sucesso">Mensagem enviada. Respondemos em até 1 dia útil.</Aviso>}
      </div>
    </form>
  );
}

function ExemploCampo({
  controle,
  rotulo,
  placeholder,
  ajuda,
  erro,
  tamanho,
  comIcone,
  obrigatorio,
  desativado,
}: {
  controle: string;
  rotulo: string;
  placeholder: string;
  ajuda: string;
  erro: string;
  tamanho: string;
  comIcone: boolean;
  obrigatorio: boolean;
  desativado: boolean;
}) {
  const [valor, setValor] = useState("");
  const comum = { value: valor, onChange: setValor, placeholder, disabled: desativado };
  const icone = controle === "EntradaDeSenha" ? ICONES.cadeado : ICONES.email;
  return (
    <div className="w-full max-w-sm">
      <Campo
        rotulo={rotulo}
        icone={comIcone ? icone : undefined}
        ajuda={ajuda || undefined}
        erro={erro || undefined}
        obrigatorio={obrigatorio}
        tamanho={tamanho as TamanhoDoCampo}
      >
        {controle === "Selecao" ? (
          <Selecao value={valor} onChange={setValor} disabled={desativado} opcoes={ASSUNTOS} vazio={placeholder} />
        ) : controle === "AreaDeTexto" ? (
          <AreaDeTexto {...comum} />
        ) : controle === "EntradaDeSenha" ? (
          <EntradaDeSenha {...comum} autoComplete="new-password" />
        ) : controle === "EntradaDeBusca" ? (
          <EntradaDeBusca {...comum} />
        ) : (
          <Entrada {...comum} />
        )}
      </Campo>
    </div>
  );
}

const MASCARAS = [
  { rotulo: "Celular", mascara: "(00) 00000-0000", modo: "tel" as const },
  { rotulo: "CNPJ", mascara: "00.000.000/0000-00", modo: "numeric" as const },
  { rotulo: "CPF", mascara: "000.000.000-00", modo: "numeric" as const },
  { rotulo: "CEP", mascara: "00000-000", modo: "numeric" as const },
  { rotulo: "Data", mascara: "00/00/0000", modo: "numeric" as const },
  { rotulo: "Placa", mascara: "AAA-0*00", modo: "text" as const },
];

function ExemploMascaras() {
  const [valores, setValores] = useState<Record<string, string>>({});
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      {MASCARAS.map((m) => (
        <Campo key={m.rotulo} rotulo={m.rotulo} ajuda={`Máscara "${m.mascara}"`}>
          <Entrada
            mascara={m.mascara}
            inputMode={m.modo}
            placeholder={m.mascara.replace(/[0A*]/g, "_")}
            value={valores[m.rotulo] ?? ""}
            onChange={(v) => setValores((atual) => ({ ...atual, [m.rotulo]: v }))}
          />
        </Campo>
      ))}
    </div>
  );
}

const PRODUTOS = [
  "Cadeira de escritório",
  "Mesa regulável",
  "Monitor 27 polegadas",
  "Teclado sem fio",
  "Mouse vertical",
  "Suporte para notebook",
  "Luminária de mesa",
  "Fone com microfone",
];

function ExemploSenhaEBusca() {
  const [senha, setSenha] = useState("");
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();
  const achados = PRODUTOS.filter((p) => p.toLowerCase().includes(termo));
  const curta = senha.length > 0 && senha.length < 8;
  return (
    <div className="grid w-full max-w-3xl gap-10 md:grid-cols-2">
      <Campo
        rotulo="Senha"
        icone={ICONES.cadeado}
        erro={curta ? "Use ao menos 8 caracteres." : undefined}
        ajuda="Ao menos 8 caracteres. Use o olho para conferir o que digitou."
      >
        <EntradaDeSenha value={senha} onChange={setSenha} autoComplete="new-password" placeholder="Crie uma senha" />
      </Campo>

      <div>
        <EntradaDeBusca
          aria-label="Buscar produtos"
          aria-controls="produtos-encontrados"
          value={busca}
          onChange={setBusca}
          placeholder="Buscar produtos..."
        />
        <p role="status" className="mt-3 text-xs text-muted">
          {achados.length === PRODUTOS.length ? `${PRODUTOS.length} produtos` : `${achados.length} de ${PRODUTOS.length} produtos`}
        </p>
        <ul id="produtos-encontrados" className="mt-2 divide-y divide-rule text-sm">
          {achados.map((p) => (
            <li key={p} className="py-2">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExemploTamanhos() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      {(["sm", "md", "lg"] as const).map((t) => (
        <div key={t} className="grid items-end gap-4 sm:grid-cols-3">
          <Campo rotulo={`Nome (${t})`} icone={ICONES.pessoa} tamanho={t}>
            <Entrada placeholder="Seu nome" />
          </Campo>
          <Campo rotulo="Estado" tamanho={t}>
            <Selecao
              defaultValue="pe"
              opcoes={[
                { valor: "pe", rotulo: "Pernambuco" },
                { valor: "sp", rotulo: "São Paulo" },
                { valor: "rs", rotulo: "Rio Grande do Sul" },
              ]}
            />
          </Campo>
          <EntradaDeBusca aria-label={`Busca (${t})`} tamanho={t} valorInicial="relatório" />
        </div>
      ))}
    </div>
  );
}

export default defineStories({
  args: {
    controle: "Entrada",
    rotulo: "E-mail",
    placeholder: "voce@empresa.com",
    ajuda: "Usamos só para responder ao seu contato.",
    erro: "",
    tamanho: "md",
    comIcone: true,
    obrigatorio: false,
    desativado: false,
  },
  controls: {
    controle: {
      type: "select",
      label: "controle (filho do Campo)",
      options: ["Entrada", "Selecao", "AreaDeTexto", "EntradaDeSenha", "EntradaDeBusca"],
    },
    rotulo: { type: "text" },
    placeholder: { type: "text" },
    ajuda: { type: "text", label: "ajuda (vazio = sem)" },
    erro: { type: "text", label: "erro (vazio = sem)" },
    tamanho: { type: "select", options: ["sm", "md", "lg"] },
    comIcone: { type: "boolean", label: "icone" },
    obrigatorio: { type: "boolean" },
    desativado: { type: "boolean", label: "disabled" },
  },
  render: (a) => <ExemploCampo key={a.controle} {...a} />,
  stories: [
    { name: "Formulário de contato", render: () => <FormularioDeContato /> },
    { name: "Campo (playground)" },
    { name: "Com erro", args: { erro: "Informe um e-mail válido, como voce@empresa.com." } },
    { name: "Máscaras", render: () => <ExemploMascaras /> },
    { name: "Senha e busca", render: () => <ExemploSenhaEBusca /> },
    { name: "Tamanhos", render: () => <ExemploTamanhos /> },
  ],
});
