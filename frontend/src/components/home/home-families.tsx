import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/store/section-heading";
import type { CategoryCollection } from "@/types/product";

type HomeFamiliesProps = {
  collections: CategoryCollection[];
};

export function HomeFamilies({ collections }: HomeFamiliesProps) {
  return (
    <section className="page-shell section-block pt-0">
      <SectionHeading
        eyebrow="nos familles"
        title="Les grandes familles du catalogue"
        description="Retrouvez rapidement les principales catégories proposées par SONACOS."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/catalogue?categoryId=${collection.id}`}
            className="card flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(24,57,38,0.08)]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-bold text-brand-strong">
                  {collection.name}
                </h3>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-strong">
                  {collection.count} ref.
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {collection.accentLabel}
              </p>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-muted">
                {collection.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {collections.length === 0 ? (
        <div className="mt-6 rounded-[16px] border border-line bg-white px-5 py-4 text-sm text-muted">
          Les familles du catalogue seront visibles dès que l’API SONACOS sera
          accessible.
        </div>
      ) : null}
    </section>
  );
}
