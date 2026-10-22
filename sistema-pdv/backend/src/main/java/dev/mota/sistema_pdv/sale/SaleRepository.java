package dev.mota.sistema_pdv.sale;

import java.time.Instant;
import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    /** Próximo número da venda. A sequence nunca repete, mesmo com dois caixas ao mesmo tempo. */
    @Query(value = "SELECT nextval('sale_number_seq')", nativeQuery = true)
    long nextNumber();

    List<Sale> findAllByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
        Instant start, Instant end);
}
