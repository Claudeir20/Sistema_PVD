-- Produtos vendidos no PDV e usados como peças nas ordens de serviço.
-- As regras (preço positivo, estoque nunca negativo...) ficam na entidade Product;
-- os CHECKs abaixo são a última barreira caso algum dado chegue errado ao banco.
CREATE TABLE products (
    id              UUID                     PRIMARY KEY,
    barcode         VARCHAR(50)              NOT NULL,
    name            VARCHAR(120)             NOT NULL,
    price_in_cents  BIGINT                   NOT NULL,
    stock_quantity  INTEGER                  NOT NULL,
    min_stock       INTEGER                  NOT NULL,
    active          BOOLEAN                  NOT NULL,
    -- Controle de concorrência otimista: cada alteração incrementa a versão.
    version         BIGINT                   NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT uk_products_barcode UNIQUE (barcode),
    CONSTRAINT ck_products_price_positive CHECK (price_in_cents > 0),
    CONSTRAINT ck_products_stock_not_negative CHECK (stock_quantity >= 0),
    CONSTRAINT ck_products_min_stock_not_negative CHECK (min_stock >= 0)
);
