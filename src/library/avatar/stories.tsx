import { defineStories } from "@/registry/stories";
import { Avatar, GrupoDeAvatares, type StatusDoAvatar, type TamanhoDeAvatar } from "./Avatar";

// "Foto" de exemplo desenhada em SVG, para o preview não depender de rede. Fundo
// transparente (aparece o bg-surface do <img>) e silhueta em preto translúcido.
const FOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" fill-opacity="0.35"><circle cx="32" cy="25" r="12"/><path d="M10 64c2-14 11-21 22-21s20 7 22 21z"/></svg>',
)}`;

const EQUIPE = [
  { nome: "Ana Souza" },
  { nome: "Bruno Lima", imagem: FOTO },
  { nome: "Carla Dias" },
  { nome: "Diego Martins" },
  { nome: "Elisa Rocha" },
  { nome: "Fábio Nunes" },
  { nome: "Gabriela Costa" },
];

const TAMANHOS: TamanhoDeAvatar[] = ["xs", "sm", "md", "lg", "xl"];

export default defineStories({
  args: {
    mostrar: "avatar",
    nome: "Mariana Albuquerque",
    comFoto: false,
    tamanho: "lg",
    status: "online",
    quantidade: 7,
    maximo: 4,
  },
  controls: {
    mostrar: { type: "select", label: "componente", options: ["avatar", "grupo"] },
    nome: { type: "text", label: "nome (Avatar)" },
    comFoto: { type: "boolean", label: "imagem (Avatar)" },
    tamanho: { type: "select", options: TAMANHOS },
    status: {
      type: "select",
      label: "status (Avatar)",
      options: ["nenhum", "online", "ausente", "ocupado", "offline"],
    },
    quantidade: { type: "number", label: "pessoas (GrupoDeAvatares)", min: 1, max: 7 },
    maximo: { type: "number", label: "maximo (GrupoDeAvatares)", min: 1, max: 7 },
  },
  // Um componente por vez: o Avatar sozinho ou o GrupoDeAvatares
  render: (a) =>
    a.mostrar === "grupo" ? (
      <GrupoDeAvatares
        rotulo="Responsáveis"
        pessoas={EQUIPE.slice(0, a.quantidade)}
        maximo={a.maximo}
        tamanho={a.tamanho as TamanhoDeAvatar}
      />
    ) : (
      <Avatar
        nome={a.nome}
        imagem={a.comFoto ? FOTO : undefined}
        tamanho={a.tamanho as TamanhoDeAvatar}
        status={a.status === "nenhum" ? undefined : (a.status as StatusDoAvatar)}
      />
    ),
  stories: [
    { name: "Avatar" },
    { name: "Grupo", args: { mostrar: "grupo" } },
    {
      name: "Avatares e grupo",
      render: () => (
        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-3">
            <Avatar nome="Ana Souza" status="online" />
            <Avatar nome="Bruno Lima" imagem={FOTO} status="ausente" />
            <Avatar nome="Carla Dias" status="ocupado" />
            <Avatar nome="Diego Martins" status="offline" />
            <Avatar nome="Marketing" />
          </div>
          <GrupoDeAvatares rotulo="Responsáveis" pessoas={EQUIPE} tamanho="md" />
        </div>
      ),
    },
    {
      name: "Tamanhos",
      render: () => (
        <div className="flex items-end gap-3">
          {TAMANHOS.map((t) => (
            <Avatar key={t} nome="Ana Souza" tamanho={t} status="online" />
          ))}
        </div>
      ),
    },
    {
      name: "Ao lado do nome",
      render: () => (
        <ul className="flex w-full max-w-xs flex-col gap-3">
          {EQUIPE.slice(0, 4).map((p) => (
            <li key={p.nome} className="flex items-center gap-3 text-sm">
              <Avatar nome={p.nome} imagem={p.imagem} tamanho="sm" decorativo />
              <span>{p.nome}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      name: "Foto que não carrega",
      render: () => (
        <div className="flex items-center gap-3 text-sm text-ink-2">
          <Avatar nome="Rafael Teixeira" imagem="/nao-existe.jpg" tamanho="lg" />
          <span>Sem a foto, ficam as iniciais.</span>
        </div>
      ),
    },
  ],
});
