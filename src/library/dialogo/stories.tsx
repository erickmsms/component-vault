import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { Botao } from "@/library/botao/Botao";
import {
  BotaoDoDialogo,
  Dialogo,
  type FundoDoDialogo,
  type PosicaoDoDialogo,
  type StatusDoDialogo,
  type TamanhoDoDialogo,
} from "./Dialogo";

const TERMOS = Array.from({ length: 14 }, (_, i) => (
  <p key={i} className="mt-3 first:mt-0">
    <strong className="text-ink">{i + 1}. Cláusula {i + 1}.</strong> O serviço é oferecido como está, e cada parte
    responde pelos dados que envia. As condições podem mudar com aviso prévio de 30 dias por e-mail.
  </p>
));

function ConfirmarComEspera() {
  const [salvando, setSalvando] = useState(false);
  const [aberto, setAberto] = useState(false);
  return (
    <Dialogo
      aberto={aberto}
      aoMudar={setAberto}
      alerta
      status="perigo"
      titulo="Excluir o projeto?"
      descricao="Os arquivos e o histórico serão apagados. Não dá para desfazer."
      gatilho={<Botao variante="perigo">Excluir com espera</Botao>}
      acoes={
        <>
          <BotaoDoDialogo variante="secundario" fecha disabled={salvando}>
            Cancelar
          </BotaoDoDialogo>
          <BotaoDoDialogo
            variante="perigo"
            carregando={salvando}
            textoCarregando="Excluindo..."
            onClick={() => {
              setSalvando(true);
              setTimeout(() => {
                setSalvando(false);
                setAberto(false);
              }, 1200);
            }}
          >
            Excluir
          </BotaoDoDialogo>
        </>
      }
    />
  );
}

export default defineStories({
  args: {
    titulo: "Excluir o projeto?",
    descricao: "Os arquivos e o histórico serão apagados. Não dá para desfazer.",
    status: "perigo",
    tamanho: "md",
    posicao: "auto",
    fundo: "escuro",
    alerta: false,
    longo: false,
    botaoFechar: true,
    incorporado: true,
  },
  controls: {
    titulo: { type: "text" },
    descricao: { type: "text" },
    status: { type: "select", options: ["", "info", "sucesso", "alerta", "perigo"] },
    tamanho: { type: "select", options: ["sm", "md", "lg", "xl"] },
    posicao: { type: "select", options: ["auto", "centro", "topo", "base"] },
    fundo: { type: "select", options: ["escuro", "desfoque", "transparente"] },
    alerta: { type: "boolean" },
    longo: { type: "boolean", label: "conteúdo longo (rola o meio)" },
    botaoFechar: { type: "boolean" },
    incorporado: { type: "boolean", label: "incorporado (desligue para abrir pelo botão)" },
  },
  render: (a) => (
    <Dialogo
      titulo={a.titulo as string}
      descricao={(a.descricao as string) || undefined}
      status={(a.status as StatusDoDialogo) || undefined}
      tamanho={a.tamanho as TamanhoDoDialogo}
      posicao={a.posicao as PosicaoDoDialogo}
      fundo={a.fundo as FundoDoDialogo}
      alerta={a.alerta as boolean}
      botaoFechar={a.botaoFechar as boolean}
      incorporado={a.incorporado as boolean}
      gatilho={<Botao variante="perigo">Abrir diálogo</Botao>}
      acoes={
        <>
          <BotaoDoDialogo variante="secundario" fecha>
            Cancelar
          </BotaoDoDialogo>
          <BotaoDoDialogo variante={a.status === "perigo" ? "perigo" : "primario"} fecha>
            Confirmar
          </BotaoDoDialogo>
        </>
      }
    >
      {a.longo ? TERMOS : <p>O projeto e tudo o que está nele deixam de existir para toda a equipe.</p>}
    </Dialogo>
  ),
  stories: [
    { name: "Confirmação" },
    { name: "Aberto pelo botão", args: { incorporado: false } },
    {
      name: "Conteúdo longo",
      args: {
        incorporado: false,
        status: "",
        titulo: "Termos de uso",
        descricao: "Leia antes de aceitar. Título e botões ficam no lugar.",
        longo: true,
        tamanho: "lg",
      },
    },
    { name: "Alerta obrigatório", args: { incorporado: false, alerta: true, botaoFechar: false } },
    {
      name: "Status",
      render: () => (
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["info", "Sair da conta?", "Você vai precisar entrar de novo.", "primario"],
              ["sucesso", "Concluir a tarefa?", "A equipe recebe um aviso.", "primario"],
              ["alerta", "Descartar alterações?", "O que não foi salvo se perde.", "primario"],
              ["perigo", "Excluir a conta?", "Seus dados saem dos servidores.", "perigo"],
            ] as const
          ).map(([status, titulo, descricao, variante]) => (
            <Dialogo
              key={status}
              status={status}
              titulo={titulo}
              descricao={descricao}
              gatilho={<Botao variante="secundario">{status}</Botao>}
              acoes={
                <>
                  <BotaoDoDialogo variante="secundario" fecha>
                    Cancelar
                  </BotaoDoDialogo>
                  <BotaoDoDialogo variante={variante} fecha>
                    Confirmar
                  </BotaoDoDialogo>
                </>
              }
            />
          ))}
        </div>
      ),
    },
    { name: "Ação assíncrona", render: () => <ConfirmarComEspera /> },
  ],
});
