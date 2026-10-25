import {
  Archivo,
  Bricolage_Grotesque,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
  Libre_Baskerville,
  Lora,
  Manrope,
  Merriweather,
  Montserrat,
  Nunito,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  Rubik,
  Sora,
  Source_Serif_4,
  Space_Grotesk,
  Space_Mono,
  Work_Sans,
} from "next/font/google";

// Todas as fontes dos temas (src/themes/fonts.ts). O next/font baixa os arquivos no build e
// os serve do próprio site: o navegador de quem visita nunca fala com o Google. Só as do
// tema padrão são pré-carregadas; as outras só baixam quando o tema as usa.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// O next/font exige opções literais no código (sem variáveis nem spread): por isso
// `subsets` e `preload` se repetem em cada fonte.
const plex = IBM_Plex_Sans({ variable: "--font-plex", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], preload: false });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], preload: false });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], preload: false });

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], preload: false });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", weight: "400", subsets: ["latin"], preload: false });
const instrumentSerif = Instrument_Serif({ variable: "--font-instrument-serif", weight: "400", subsets: ["latin"], preload: false });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], preload: false });
const libreBaskerville = Libre_Baskerville({ variable: "--font-libre-baskerville", subsets: ["latin"], preload: false });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], preload: false });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"], preload: false });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], preload: false });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], preload: false });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], preload: false });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], preload: false });
const poppins = Poppins({ variable: "--font-poppins", weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], preload: false });
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"], preload: false });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], preload: false });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], preload: false });
const spaceMono = Space_Mono({ variable: "--font-space-mono", weight: ["400", "700"], subsets: ["latin"], preload: false });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"], preload: false });

/** Classes das variáveis de fonte, para ir no <html>. */
export const CLASSES_DAS_FONTES = [
  geistSans,
  geistMono,
  archivo,
  inter,
  plex,
  fraunces,
  nunito,
  spaceGrotesk,
  bricolage,
  dmSans,
  dmSerif,
  instrumentSerif,
  jetbrains,
  libreBaskerville,
  lora,
  manrope,
  merriweather,
  montserrat,
  outfit,
  playfair,
  jakarta,
  poppins,
  rubik,
  sora,
  sourceSerif,
  spaceMono,
  workSans,
]
  .map((f) => f.variable)
  .join(" ");
