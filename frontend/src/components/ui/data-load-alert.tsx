import Link from "next/link";
import { AlertIcon } from "@/components/ui/store-icons";

type DataLoadAlertProps = {
  title?: string;
  description: string;
  retryHref?: string;
  retryLabel?: string;
};

export function DataLoadAlert({
  title = "Impossible de charger les donnees",
  description,
  retryHref,
  retryLabel = "Reessayer",
}: DataLoadAlertProps) {
  return (
    <div className="card p-6">
      <div className="rounded-[20px] border border-danger/15 bg-danger/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-danger">{title}</p>
            <p className="mt-1 text-sm leading-6 text-danger/90">{description}</p>
            {retryHref ? (
              <div className="mt-4">
                <Link href={retryHref} className="button-secondary">
                  {retryLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
