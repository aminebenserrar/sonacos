CREATE TABLE roles (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    label VARCHAR(120) NOT NULL
);

CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    phone VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(160) NOT NULL UNIQUE,
    description VARCHAR(MAX),
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE products (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    slug VARCHAR(180) NOT NULL UNIQUE,
    reference VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(180) NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    full_description VARCHAR(MAX) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(80) NOT NULL,
    image_url VARCHAR(500),
    stock_quantity INT NOT NULL,
    alert_threshold INT NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    featured BIT NOT NULL DEFAULT 0,
    category_id BIGINT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE carts (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    client_id BIGINT NOT NULL UNIQUE,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_carts_client FOREIGN KEY (client_id) REFERENCES users (id)
);

CREATE TABLE cart_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id),
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE [orders] (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_number VARCHAR(120) NOT NULL UNIQUE,
    client_id BIGINT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(40) NOT NULL,
    reception_mode VARCHAR(40) NOT NULL,
    delivery_address VARCHAR(255),
    payment_mode VARCHAR(40) NOT NULL,
    comment VARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_orders_client FOREIGN KEY (client_id) REFERENCES users (id)
);

CREATE TABLE order_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name_snapshot VARCHAR(180) NOT NULL,
    product_reference_snapshot VARCHAR(120) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES [orders] (id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE payments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payment_reference VARCHAR(120) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    payment_mode VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    payment_date DATETIME2 NULL,
    validated_by BIGINT NULL,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES [orders] (id),
    CONSTRAINT fk_payments_validated_by FOREIGN KEY (validated_by) REFERENCES users (id)
);

CREATE TABLE invoices (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    invoice_number VARCHAR(120) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL UNIQUE,
    amount_excluding_tax DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    pdf_path VARCHAR(500) NOT NULL,
    generated_at DATETIME2 NOT NULL,
    CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES [orders] (id)
);

CREATE TABLE stock_movements (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id BIGINT NOT NULL,
    movement_type VARCHAR(40) NOT NULL,
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    performed_by BIGINT NULL,
    created_at DATETIME2 NOT NULL,
    CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_stock_movements_user FOREIGN KEY (performed_by) REFERENCES users (id)
);

CREATE TABLE validation_operations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    operation_type VARCHAR(40) NOT NULL,
    target_reference VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    requester_id BIGINT NULL,
    responsible_id BIGINT NULL,
    status VARCHAR(40) NOT NULL,
    priority VARCHAR(40) NOT NULL,
    rejection_reason VARCHAR(MAX) NULL,
    requested_at DATETIME2 NOT NULL,
    decided_at DATETIME2 NULL,
    CONSTRAINT fk_validation_operations_requester FOREIGN KEY (requester_id) REFERENCES users (id),
    CONSTRAINT fk_validation_operations_responsible FOREIGN KEY (responsible_id) REFERENCES users (id)
);

CREATE TABLE operation_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    action_type VARCHAR(120) NOT NULL,
    object_type VARCHAR(120) NOT NULL,
    object_identifier VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    user_id BIGINT NULL,
    created_at DATETIME2 NOT NULL,
    old_value VARCHAR(MAX) NULL,
    new_value VARCHAR(MAX) NULL,
    CONSTRAINT fk_operation_history_user FOREIGN KEY (user_id) REFERENCES users (id)
);
