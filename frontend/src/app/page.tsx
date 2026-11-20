import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { HomeFamilies } from "@/components/home/home-families";
import { HomeHero } from "@/components/home/home-hero";
import { PublicShell } from "@/components/layout/public-shell";
import { getHomeCategoryCollections } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  let collections: Awaited<ReturnType<typeof getHomeCategoryCollections>> | null = null;

  try {
    collections = await getHomeCategoryCollections();
  } catch {
    collections = null;
  }

  return (
    <PublicShell>
      <HomeHero />
      {collections ? (
        <HomeFamilies collections={collections} />
      ) : (
        <div className="page-shell pb-10">
          <DataLoadAlert
            description="Les familles du catalogue n'ont pas pu etre chargees depuis l'API publique."
            retryHref="/"
          />
        </div>
      )}
    </PublicShell>
  );
}
