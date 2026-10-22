// Gerado por scripts/gerar-registro.mjs — não edite à mão (rode `npm run registro`).
import abas from "@/library/abas/stories";
import abertura from "@/library/abertura/stories";
import aberturaComImagem from "@/library/abertura-com-imagem/stories";
import acordeao from "@/library/acordeao/stories";
import acordeaoComMidia from "@/library/acordeao-com-midia/stories";
import areaDeUpload from "@/library/area-de-upload/stories";
import avatar from "@/library/avatar/stories";
import aviso from "@/library/aviso/stories";
import barraDeBusca from "@/library/barra-de-busca/stories";
import barraDeFiltros from "@/library/barra-de-filtros/stories";
import barraDeProgresso from "@/library/barra-de-progresso/stories";
import barraLateral from "@/library/barra-lateral/stories";
import blocosDeTexto from "@/library/blocos-de-texto/stories";
import botao from "@/library/botao/stories";
import botaoFlutuante from "@/library/botao-flutuante/stories";
import cabecalho from "@/library/cabecalho/stories";
import campoDeEtiquetas from "@/library/campo-de-etiquetas/stories";
import campoDeFormulario from "@/library/campo-de-formulario/stories";
import campoDeMoeda from "@/library/campo-de-moeda/stories";
import cartaoKpi from "@/library/cartao-kpi/stories";
import chamadaFinal from "@/library/chamada-final/stories";
import contador from "@/library/contador/stories";
import dica from "@/library/dica/stories";
import esqueleto from "@/library/esqueleto/stories";
import estadoVazio from "@/library/estado-vazio/stories";
import etapasInterativas from "@/library/etapas-interativas/stories";
import etiquetas from "@/library/etiquetas/stories";
import gradeNumerada from "@/library/grade-numerada/stories";
import graficoComSeletor from "@/library/grafico-com-seletor/stories";
import graficoLinhas from "@/library/grafico-linhas/stories";
import heroComMidia from "@/library/hero-com-midia/stories";
import linhaDoTempoDeAtividades from "@/library/linha-do-tempo-de-atividades/stories";
import listaDeTarefas from "@/library/lista-de-tarefas/stories";
import listaEmFoco from "@/library/lista-em-foco/stories";
import mapaDeCalor from "@/library/mapa-de-calor/stories";
import menuDeAcoes from "@/library/menu-de-acoes/stories";
import menuSuspenso from "@/library/menu-suspenso/stories";
import navegacaoFlutuante from "@/library/navegacao-flutuante/stories";
import notificacoes from "@/library/notificacoes/stories";
import numerosPrincipais from "@/library/numeros-principais/stories";
import passosNumerados from "@/library/passos-numerados/stories";
import pilhaDeCartoes from "@/library/pilha-de-cartoes/stories";
import quadroKanban from "@/library/quadro-kanban/stories";
import quadroMetricas from "@/library/quadro-metricas/stories";
import ranking from "@/library/ranking/stories";
import revelar from "@/library/revelar/stories";
import rodapeEmColunas from "@/library/rodape-em-colunas/stories";
import secao from "@/library/secao/stories";
import seletorDeCor from "@/library/seletor-de-cor/stories";
import seletorDePeriodo from "@/library/seletor-de-periodo/stories";
import seletorMultiplo from "@/library/seletor-multiplo/stories";
import seletorUnico from "@/library/seletor-unico/stories";
import tabelaDados from "@/library/tabela-dados/stories";
import textoAceso from "@/library/texto-aceso/stories";
import tituloVivo from "@/library/titulo-vivo/stories";
import trilhaDeNavegacao from "@/library/trilha-de-navegacao/stories";
import type { StoriesModule } from "./stories";

// Exemplos de cada componente (src/library/<slug>/stories.tsx). Ficam separados dos
// metadados porque só são renderizados no cliente: nos cards e nos iframes de preview.
export const allStories: Record<string, StoriesModule> = {
  abas,
  abertura,
  "abertura-com-imagem": aberturaComImagem,
  acordeao,
  "acordeao-com-midia": acordeaoComMidia,
  "area-de-upload": areaDeUpload,
  avatar,
  aviso,
  "barra-de-busca": barraDeBusca,
  "barra-de-filtros": barraDeFiltros,
  "barra-de-progresso": barraDeProgresso,
  "barra-lateral": barraLateral,
  "blocos-de-texto": blocosDeTexto,
  botao,
  "botao-flutuante": botaoFlutuante,
  cabecalho,
  "campo-de-etiquetas": campoDeEtiquetas,
  "campo-de-formulario": campoDeFormulario,
  "campo-de-moeda": campoDeMoeda,
  "cartao-kpi": cartaoKpi,
  "chamada-final": chamadaFinal,
  contador,
  dica,
  esqueleto,
  "estado-vazio": estadoVazio,
  "etapas-interativas": etapasInterativas,
  etiquetas,
  "grade-numerada": gradeNumerada,
  "grafico-com-seletor": graficoComSeletor,
  "grafico-linhas": graficoLinhas,
  "hero-com-midia": heroComMidia,
  "linha-do-tempo-de-atividades": linhaDoTempoDeAtividades,
  "lista-de-tarefas": listaDeTarefas,
  "lista-em-foco": listaEmFoco,
  "mapa-de-calor": mapaDeCalor,
  "menu-de-acoes": menuDeAcoes,
  "menu-suspenso": menuSuspenso,
  "navegacao-flutuante": navegacaoFlutuante,
  notificacoes,
  "numeros-principais": numerosPrincipais,
  "passos-numerados": passosNumerados,
  "pilha-de-cartoes": pilhaDeCartoes,
  "quadro-kanban": quadroKanban,
  "quadro-metricas": quadroMetricas,
  ranking,
  revelar,
  "rodape-em-colunas": rodapeEmColunas,
  secao,
  "seletor-de-cor": seletorDeCor,
  "seletor-de-periodo": seletorDePeriodo,
  "seletor-multiplo": seletorMultiplo,
  "seletor-unico": seletorUnico,
  "tabela-dados": tabelaDados,
  "texto-aceso": textoAceso,
  "titulo-vivo": tituloVivo,
  "trilha-de-navegacao": trilhaDeNavegacao,
};
