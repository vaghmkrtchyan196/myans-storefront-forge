import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label ?? "Բեռնվում է…"}
    </div>
  );
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-border px-6 py-16 text-center">
      <p className="text-sm font-medium">Ինչ-որ բան այնպես չգնաց։</p>
      <p className="text-sm text-muted-foreground">
        {message ?? "Խնդրում ենք փորձել կրկին մի փոքր ուշ։"}
      </p>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/5] w-full bg-muted" />
          <div className="mt-3 h-3 w-2/3 bg-muted" />
          <div className="mt-2 h-3 w-1/3 bg-muted" />
        </div>
      ))}
    </div>
  );
}
