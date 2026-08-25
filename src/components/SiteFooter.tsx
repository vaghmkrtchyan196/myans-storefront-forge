import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div>
          <p className="brand-wordmark text-lg">MYANS</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Հայկական ժամանակակից streetwear բրենդ։
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/shop" className="text-muted-foreground hover:text-foreground">
            Խանութ
          </Link>
          <Link to="/new" className="text-muted-foreground hover:text-foreground">
            Նորույթներ
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            Մեր մասին
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Երևան, Հայաստան</p>
          <p className="mt-2">© {new Date().getFullYear()} MYANS</p>
        </div>
      </div>
    </footer>
  );
}
