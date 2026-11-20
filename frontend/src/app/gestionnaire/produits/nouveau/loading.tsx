import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";

export default function NewManagerProductLoading() {
  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Ajouter un produit"
        description="Chargement du formulaire produit."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Produits" },
          { label: "Ajouter" },
        ]}
      />

      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <section key={index} className="card animate-pulse p-6">
            <div className="h-5 w-56 rounded-full bg-brand/10" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="h-20 rounded-[16px] bg-brand/8" />
              <div className="h-20 rounded-[16px] bg-brand/8" />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
