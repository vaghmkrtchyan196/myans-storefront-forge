import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/hooks/use-cart";

const NAV_LINKS = [
  { to: "/shop", label: "Խանութ" },
  { to: "/new", label: "Նորույթներ" },
  { to: "/about", label: "Մեր մասին" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { count } = useCart();
  const navigate = useNavigate();

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate({ to: "/shop", search: { q: term.trim() || undefined } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-8">
        <button
          type="button"
          aria-label="Մենյու"
          className="-ml-2 flex h-11 w-11 items-center justify-center md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="label-caps text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "label-caps text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          className="brand-wordmark absolute left-1/2 -translate-x-1/2 text-lg md:static md:left-auto md:translate-x-0 md:text-xl"
        >
          MYANS
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Որոնում"
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/cart"
            aria-label="Զամբյուղ"
            className="relative flex h-11 w-11 items-center justify-center"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-border px-4 py-3 md:px-8">
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Որոնել ապրանք…"
            aria-label="Որոնել ապրանք"
            className="h-11 w-full border border-input bg-background px-3 outline-none focus:border-ring"
          />
        </form>
      )}

      {menuOpen && (
        <nav className="border-t border-border md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-border px-4 py-4 text-base"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
