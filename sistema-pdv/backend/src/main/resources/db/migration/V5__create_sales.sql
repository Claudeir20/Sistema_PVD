-- Vendas do PDV e seus itens. O estoque é baixado pela movimentação ligada à venda (stock_movement_id);
-- no cancelamento, uma movimentação de entrada devolve os itens (cancellation_movement_id).

-- Número sequencial da venda (V-0001, V-0002...). A sequence garante números únicos
-- mesmo com dois caixas vendendo ao mesmo tempo.
CREATE SEQUENCE sale_number_seq START WITH 1;

CREATE TABLE sales (
    id                        UUID                     PRIMARY KEY,
    number                    BIGINT                   NOT NULL,
    status                    VARCHAR(20)              NOT NULL,
    payment_method            VARCHAR(20)              NOT NULL,
    subtotal_in_cents         BIGINT                   NOT NULL,
    discount_in_cents         BIGINT                   NOT NULL,
    total_in_cents            BIGINT                   NOT NULL,
    customer_cpf              VARCHAR(11),
    seller_id                 UUID                     NOT NULL,
    stock_movement_id         UUID                     NOT NULL,
    cancellation_movement_id  UUID,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT uk_sales_number UNIQUE (number),
    CONSTRAINT uk_sales_stock_movement UNIQUE (stock_movement_id),
    CONSTRAINT uk_sales_cancellation_movement UNIQUE (cancellation_movement_id),
    CONSTRAINT fk_sales_seller FOREIGN KEY (seller_id) REFERENCES users (id),
    CONSTRAINT fk_sales_stock_movement FOREIGN KEY (stock_movement_id) REFERENCES movements (id),
    CONSTRAINT fk_sales_cancellation_movement FOREIGN KEY (cancellation_movement_id) REFERENCES movements (id),
    CONSTRAINT ck_sales_discount_valid CHECK (discount_in_cents >= 0 AND discount_in_cents <= subtotal_in_cents),
    CONSTRAINT ck_sales_total_matches CHECK (total_in_cents = subtotal_in_cents - discount_in_cents)
);

CREATE TABLE sale_items (
    id                   UUID    PRIMARY KEY,
    sale_id              UUID    NOT NULL,
    product_id           UUID    NOT NULL,
    quantity             INTEGER NOT NULL,
    unit_price_in_cents  BIGINT  NOT NULL,
    total_in_cents       BIGINT  NOT NULL,

    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales (id),
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT ck_sale_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_sale_items_price_positive CHECK (unit_price_in_cents > 0)
);

CREATE INDEX ix_sales_seller ON sales (seller_id);
CREATE INDEX ix_sale_items_sale ON sale_items (sale_id);
CREATE INDEX ix_sale_items_product ON sale_items (product_id);
