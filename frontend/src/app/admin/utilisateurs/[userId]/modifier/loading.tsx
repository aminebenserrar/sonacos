import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";

export default function AdminUserEditLoading() {
  return (
    <>
      <WorkspacePageHeader
        eyebrow="Administration"
        title="Modifier l'utilisateur"
        description="Chargement des informations du compte utilisateur."
        breadcrumbs={[
          { label: "Administration" },
          { label: "Utilisateurs" },
          { label: "Modifier" },
        ]}
      />

      <div className="grid gap-6">
        <section className="card animate-pulse p-6">
          <div className="h-16 max-w-xl rounded-[18px] bg-brand/10" />
        </section>
        <section className="card animate-pulse p-6">
          <div className="h-5 w-60 rounded-full bg-brand/10" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-20 rounded-[16px] bg-brand/8" />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
