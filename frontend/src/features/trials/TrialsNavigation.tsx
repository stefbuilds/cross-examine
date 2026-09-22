import { NavLink } from "react-router-dom";

export function TrialsNavigation() {
  return <nav aria-label="Trials sections" className="mx-auto flex w-full max-w-[88rem] gap-1 px-4 pt-6 md:px-8">
    {[{ to: "/trials", label: "Trials" }, { to: "/corpus", label: "Corpus" }].map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-5 py-2 text-sm transition-colors ${isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>{label}</NavLink>)}
  </nav>;
}
