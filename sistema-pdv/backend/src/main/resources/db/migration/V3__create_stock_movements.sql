
CREATE TABLE movements(

    id      UUID        PRIMARY KEY,
    type                VARCHAR(50)                 NOT NULL,
    date                TIMESTAMP WITH TIME ZONE    NOT NULL,
    observation         VARCHAR(150)

);

CREATE TABLE movement_items (
    id              UUID      PRIMARY KEY,
    movement_id     UUID      NOT NULL,
    product_id      UUID      NOT NULL,
    quantity        INTEGER   NOT NULL,
    balance_after   INTEGER   NOT NULL,

    CONSTRAINT fk_movement_items_movement FOREIGN KEY  (movement_id) REFERENCES movements (id),
    CONSTRAINT fk_movement_items_product FOREIGN KEY  (product_id) REFERENCES products (id),
    CONSTRAINT ck_movement_items_balance_not_negative CHECK ( balance_after >=0 )
);

CREATE INDEX ix_movement_items_product ON movement_items (product_id);
CREATE INDEX ix_movement_items_movement ON movement_items (movement_id);