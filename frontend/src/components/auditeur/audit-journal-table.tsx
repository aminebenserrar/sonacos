"use client";

import Link from "next/link";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { StatusBadge } from "@/components/ui/status-badge";
import { EyeIcon } from "@/components/ui/store-icons";
import { formatAuditAction, formatAuditModule } from "@/lib/audit";
import { formatDateTime } from "@/lib/formatters";
import type { AuditLogEntry } from "@/types/audit";

type AuditJournalTableProps = {
  entries: AuditLogEntry[];
  detailBasePath: string;
  returnTo: string;
};

export function AuditJournalTable({
  entries,
  detailBasePath,
  returnTo,
}: AuditJournalTableProps) {
  const buildDetailHref = (entry: AuditLogEntry) =>
    `${detailBasePath}/${entry.id}?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <ResponsiveRecords
      items={entries}
      empty={null}
      desktop={
        <div className="table-scroll">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>Reference</th>
                <th>Niveau</th>
                <th>Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(entry.createdAt)}</td>
                  <td className="font-semibold">{entry.performedByFullName}</td>
                  <td>
                    <StatusBadge value={entry.performedByRole} kind="role" />
                  </td>
                  <td>{formatAuditAction(entry.actionType)}</td>
                  <td>{formatAuditModule(entry.objectType)}</td>
                  <td className="font-semibold">{entry.objectIdentifier}</td>
                  <td>
                    <StatusBadge value={entry.level} />
                  </td>
                  <td className="max-w-[320px] text-sm text-muted">{entry.description}</td>
                  <td>
                    <Link
                      href={buildDetailHref(entry)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-brand-strong transition hover:border-brand hover:bg-brand/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                      aria-label={`Voir le detail de l operation ${entry.objectIdentifier}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                      Voir le detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      renderMobileCard={(entry) => (
        <MobileDataCard
          key={entry.id}
          title={formatAuditAction(entry.actionType)}
          subtitle={`${formatAuditModule(entry.objectType)} - ${entry.objectIdentifier}`}
          badges={
            <>
              <StatusBadge value={entry.level} />
              <StatusBadge value={entry.performedByRole} kind="role" />
            </>
          }
          description={entry.description}
          fields={[
            { label: "Utilisateur", value: entry.performedByFullName },
            { label: "Date", value: formatDateTime(entry.createdAt) },
            { label: "Module", value: formatAuditModule(entry.objectType) },
            { label: "Reference", value: entry.objectIdentifier },
          ]}
          actions={
            <Link
              href={buildDetailHref(entry)}
              className="button-secondary px-4"
              aria-label={`Voir le detail de l operation ${entry.objectIdentifier}`}
            >
              Voir le detail
            </Link>
          }
        />
      )}
    />
  );
}
