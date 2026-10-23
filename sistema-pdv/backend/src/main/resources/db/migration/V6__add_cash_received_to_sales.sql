-- Valor que o cliente entregou em dinheiro; o troco é calculado (recebido - total).
ALTER TABLE sales ADD COLUMN cash_received_in_cents BIGINT;

-- Vendas em dinheiro de antes desta migração: considera que foram pagas no valor exato,
-- senão a regra abaixo não poderia ser criada.
UPDATE sales SET cash_received_in_cents = total_in_cents WHERE payment_method = 'CASH';

-- Dinheiro: valor recebido obrigatório e suficiente. Outras formas: sem valor recebido.
ALTER TABLE sales ADD CONSTRAINT ck_sales_cash_received CHECK (
    (payment_method = 'CASH' AND cash_received_in_cents IS NOT NULL
        AND cash_received_in_cents >= total_in_cents)
    OR (payment_method <> 'CASH' AND cash_received_in_cents IS NULL)
);