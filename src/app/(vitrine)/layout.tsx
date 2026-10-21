import Link from "next/link";
import { Cabecalho } from "@/library/cabecalho/Cabecalho";
import { ThemeControls } from "@/showcase/theme/theme-controls";
import { THEME_ATTR } from "@/themes/tokens";

export default function VitrineLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* O próprio Cabeçalho da biblioteca (src/library/cabecalho). "contents" passa os tokens
          do tema sem criar uma caixa, para o sticky continuar valendo na página inteira. */}
      <div data-theme={THEME_ATTR} className="contents">
        <Cabecalho titulo={<Link href="/">Component Vault</Link>} larguraMaxima="max-w-none">
          <ThemeControls />
        </Cabecalho>
      </div>
      <main className="w-full flex-1 px-6 py-8">{children}</main>
    </>
  );
}
