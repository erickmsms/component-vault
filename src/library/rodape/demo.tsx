import { Rodape } from "./Rodape";

export default function RodapeDemo() {
  return (
    <div className="w-full">
      <Rodape
        links={[
          { rotulo: "Documentação", href: "#documentacao" },
          { rotulo: "Código no GitHub", href: "#github" },
        ]}
      >
        Dados atualizados diariamente · 1 – 31 out 2026
      </Rodape>
    </div>
  );
}
