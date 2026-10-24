-- Quem cancelou, quando e por quê: o cancelamento é o ponto mais sensível do caixa.
ALTER TABLE
    sales
ADD
    COLUMN canceled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE
    sales
ADD
    COLUMN canceled_by_id UUID;

ALTER TABLE
    sales
ADD
    COLUMN cancellation_reason VARCHAR(200);

ALTER TABLE
    sales
ADD
    CONSTRAINT fk_sales_canceled_by FOREIGN KEY (canceled_by_id) REFERENCES users (id);

-- Cancelamentos de antes desta migração: a data vem da movimentação de devolução;
-- quem cancelou e o motivo ficam sem registro (não há como saber).
UPDATE
    sales
SET
    canceled_at = (
        SELECT
            m.date
        FROM
            movements m
        WHERE
            m.id = sales.cancellation_movement_id
    )
WHERE
    status = 'CANCELED';

-- Venda cancelada sempre tem data; venda concluída não tem nada de cancelamento.
ALTER TABLE
    sales
ADD
    CONSTRAINT ck_sales_cancellation CHECK (
        (
            status = 'CANCELED'
            AND canceled_at IS NOT NULL
        )
        OR (
            status <> 'CANCELED'
            AND canceled_at IS NULL
            AND canceled_by_id IS NULL
            AND cancellation_reason IS NULL
        )
    );