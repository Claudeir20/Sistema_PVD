package dev.mota.sistema_pdv.sale;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    /** Próximo número da venda. A sequence nunca repete, mesmo com dois caixas ao mesmo tempo. */
    @Query(value = "SELECT nextval('sale_number_seq')", nativeQuery = true)
    long nextNumber();
}
