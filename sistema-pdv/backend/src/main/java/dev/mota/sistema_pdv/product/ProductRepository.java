package dev.mota.sistema_pdv.product;

import dev.mota.sistema_pdv.movements.MovementItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Set;
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

    @Query("""
            SELECT i FROM MovementItems i
            JOIN FETCH i.movement
            WHERE i.product.id = :productId
            ORDER BY i.movement.date DESC
            """)
    List<MovementItems> findHistoryOfProduct(UUID productId);

    List<Product> findAllActiveFalseOrderByNameAsc();

    @Query("select p.barcode from Product p where p.barcode in :barcodes")
    Set<String> findExistingBarcodes(Collection<String> barcodes);
}
