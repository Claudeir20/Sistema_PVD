package dev.mota.sistema_pdv.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsByBarcode(String barcode);
    // ProductRepository
    List<Product> findAllByActiveTrueOrderByNameAsc();

    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true AND p.stockQuantity <= p.minStock
        ORDER BY p.name
        """)
    List<Product> findActiveBelowMinStock();
}
