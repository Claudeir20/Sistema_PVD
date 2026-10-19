package dev.mota.sistema_pdv.product;

import dev.mota.sistema_pdv.product.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @GetMapping
    public List<ProductResponse> findAll() {
        return productService.findAllActive();
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable UUID id) {
        return productService.findProductById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @PostMapping("/{id}/restock")
    public ProductResponse restock(@PathVariable UUID id, @Valid @RequestBody RestockProductRequest request) {
        return productService.restock(id, request.quantity());
    }

    @PostMapping("/{id}/archive")
    public ProductResponse archive(@PathVariable UUID id) {
        return productService.archive(id);
    }

    @PostMapping("/{id}/reactivate")
    public ProductResponse reactivate(@PathVariable UUID id) {
        return productService.reactivate(id);
    }

    @GetMapping("/low-stock")
    public List<ProductResponse> lowStock() {
        return productService.findLowStock();
    }

    @PostMapping("/{id}/adjust")
    public ProductResponse adjustStock(@Valid @RequestBody AdjustStockRequest request, @PathVariable UUID id) {
        return productService.adjustStock(request, id);
    }

    @GetMapping("/{id}/movements")
    public List<ProductMovementResponse> movements(@PathVariable UUID id) {
        return productService.findMovementOfProduct(id);
    }
}
