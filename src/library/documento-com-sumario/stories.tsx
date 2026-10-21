import { defineStories } from "@/registry/stories";
import { DocumentoComSumario, type SecaoDoDocumento } from "./DocumentoComSumario";

const LINK = "text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:decoration-accent";

const TERMOS: SecaoDoDocumento[] = [
  {
    titulo: "Aceitação dos termos",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "Ao criar uma conta ou usar a plataforma, você concorda com estes Termos de Uso. Se não concordar com alguma parte, não use o serviço.",
      },
    ],
  },
  {
    titulo: "Uso da plataforma",
    blocos: [
      {
        tipo: "paragrafo",
        texto: "Você pode usar a plataforma para organizar projetos, tarefas e equipes da sua empresa. Não é permitido:",
      },
      {
        tipo: "lista",
        itens: [
          "Usar o serviço para qualquer finalidade ilegal ou não autorizada",
          "Tentar acessar áreas, contas ou dados que não são seus",
          "Interferir no funcionamento da plataforma ou sobrecarregá-la de propósito",
          "Enviar vírus, códigos maliciosos ou conteúdo enganoso",
        ],
      },
    ],
  },
  {
    titulo: "Planos e pagamentos",
    blocos: [
      { tipo: "paragrafo", texto: "Os planos são cobrados de forma antecipada, conforme o período escolhido:" },
      {
        tipo: "cartoes",
        itens: [
          { titulo: "Mensal", texto: "Cobrança todo mês, no dia da contratação. Cancele quando quiser, sem multa." },
          { titulo: "Anual", texto: "Pagamento único com desconto de dois meses. O valor não é devolvido após 7 dias." },
          { titulo: "Empresarial", texto: "Contrato próprio, com faturamento por nota fiscal e condições negociadas." },
        ],
      },
    ],
  },
  {
    titulo: "Propriedade intelectual",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "O código, a marca, os textos e o design da plataforma pertencem à empresa. O conteúdo que você cadastra continua sendo seu, e você pode exportá-lo a qualquer momento.",
      },
    ],
  },
  {
    titulo: "Limitação de responsabilidade",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "Fazemos o possível para manter o serviço disponível e seguro, mas não respondemos por danos indiretos decorrentes de falhas de conexão, de terceiros ou do uso inadequado da plataforma.",
      },
    ],
  },
  {
    titulo: "Alterações nos termos",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "Podemos atualizar estes termos. Mudanças importantes são avisadas por e-mail com pelo menos 30 dias de antecedência, e a data no topo desta página sempre indica a última revisão.",
      },
    ],
  },
  {
    titulo: "Contato",
    blocos: [
      { tipo: "paragrafo", texto: "Para dúvidas sobre estes termos, fale com a gente:" },
      {
        tipo: "conteudo",
        conteudo: (
          <ul className="space-y-3 rounded-3xl border border-rule p-6 sm:p-8">
            <li>
              <a href="mailto:contato@exemplo.com" className={LINK}>
                contato@exemplo.com
              </a>
            </li>
            <li>
              <a href="tel:+551140000000" className={LINK}>
                (11) 4000-0000
              </a>
            </li>
            <li>Segunda a sexta, das 9h às 18h</li>
          </ul>
        ),
      },
    ],
  },
];

const PRIVACIDADE: SecaoDoDocumento[] = [
  {
    titulo: "Dados que coletamos",
    blocos: [
      {
        tipo: "lista",
        itens: [
          "Dados de cadastro: nome, e-mail e empresa",
          "Dados de uso: páginas acessadas, horários e dispositivo",
          "Conteúdo que você cria: projetos, tarefas e comentários",
        ],
      },
    ],
  },
  {
    titulo: "Como usamos os dados",
    blocos: [
      {
        tipo: "paragrafo",
        texto: "Usamos os dados só para prestar o serviço, dar suporte e melhorar a plataforma. Não vendemos dados pessoais.",
      },
    ],
  },
  {
    titulo: "Seus direitos",
    blocos: [
      {
        tipo: "cartoes",
        itens: [
          { titulo: "Acesso", texto: "Peça uma cópia de todos os dados que guardamos sobre você." },
          { titulo: "Correção", texto: "Atualize dados incompletos, incorretos ou desatualizados." },
          { titulo: "Exclusão", texto: "Peça a exclusão dos seus dados, salvo os que a lei obriga a manter." },
        ],
      },
    ],
  },
  {
    titulo: "Cookies",
    blocos: [
      {
        tipo: "conteudo",
        conteudo: (
          <p>
            Usamos cookies essenciais para manter você conectado. Veja a{" "}
            <a href="#cookies" className={LINK}>
              política de cookies
            </a>{" "}
            para saber como desativar os opcionais.
          </p>
        ),
      },
    ],
  },
];

export default defineStories({
  args: {
    titulo: "Termos de Uso",
    atualizado: "11 de agosto de 2026",
    rotuloSumario: "Nesta página",
    comVoltar: true,
  },
  controls: {
    titulo: { type: "text" },
    atualizado: { type: "text", label: "atualizado (vazio = sem)" },
    rotuloSumario: { type: "text" },
    comVoltar: { type: "boolean", label: "voltar (link acima do título)" },
  },
  render: (a) => (
    <DocumentoComSumario
      titulo={a.titulo}
      atualizado={a.atualizado || undefined}
      rotuloSumario={a.rotuloSumario}
      voltar={a.comVoltar ? { rotulo: "Voltar ao início", href: "#" } : undefined}
      secoes={TERMOS}
    />
  ),
  stories: [
    { name: "Termos de uso" },
    { name: "Sem link de voltar", args: { comVoltar: false } },
    {
      name: "Política de privacidade",
      render: () => (
        <DocumentoComSumario
          titulo="Política de Privacidade"
          atualizado="3 de março de 2026"
          rotuloAtualizado="Revisada em"
          rotuloSumario="Conteúdo"
          voltar={{ rotulo: "Voltar à central de ajuda", href: "#" }}
          secoes={PRIVACIDADE}
        />
      ),
    },
  ],
});
