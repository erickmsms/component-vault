import { FiltrosProvider, VitrineShell } from "@/showcase/filters";
import { SelecaoProvider } from "@/showcase/selecao";
import { VitrineHeader } from "@/showcase/vitrine-header";
import { THEME_ATTR } from "@/themes/tokens";

export default function VitrineLayout({ children }: LayoutProps<"/">) {
  return (
    <FiltrosProvider>
      {/* "contents" passa os tokens do tema sem criar uma caixa, para o sticky continuar
          valendo na página inteira. */}
      <div data-theme={THEME_ATTR} className="contents">
        <VitrineHeader />
      </div>
      <main className="w-full flex-1 px-6 py-8">
        <SelecaoProvider>
          <VitrineShell>{children}</VitrineShell>
        </SelecaoProvider>
      </main>
    </FiltrosProvider>
  );
}
