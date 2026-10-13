package dev.mota.sistema_pdv.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsByBarcode(String barcode);
    // ProductRepository
    List<Product> findAllByActiveTrueOrderByNameAsc();
}
