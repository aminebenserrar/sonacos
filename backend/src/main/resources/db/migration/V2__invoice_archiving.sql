ALTER TABLE invoices
ADD archived BIT NOT NULL CONSTRAINT df_invoices_archived DEFAULT 0;

ALTER TABLE invoices
ADD archived_at DATETIME2 NULL;

ALTER TABLE invoices
ADD archived_by BIGINT NULL;

ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_archived_by
FOREIGN KEY (archived_by) REFERENCES users (id);
