import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Մեր մասին — MYANS" },
      {
        name: "description",
        content: "MYANS-ը հայկական ժամանակակից streetwear բրենդ է՝ ինքնության և պարզության շուրջ։",
      },
      { property: "og:title", content: "Մեր մասին — MYANS" },
      { property: "og:description", content: "MYANS — հայկական ժամանակակից streetwear բրենդ։" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-28">
      <h1 className="brand-wordmark text-2xl md:text-3xl">MYANS</h1>
      <p className="mt-8 text-base leading-relaxed md:text-lg">
        MYANS-ը հայկական ժամանակակից streetwear բրենդ է՝ կառուցված ինքնության, պարզության և
        ժամանակակից դիզայնի շուրջ։
      </p>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
        Առաջին հավաքածուն շապիկներն են՝ մաքուր ձևեր, խիտ բամբակ, ոչ ավելորդ դետալներ։
      </p>
      <Link
        to="/shop"
        className="mt-10 inline-flex h-12 items-center border border-primary px-8 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Դիտել հավաքածուն
      </Link>
    </main>
  );
}
