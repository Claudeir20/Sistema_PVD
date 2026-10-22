package dev.mota.sistema_pdv.sale;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import dev.mota.sistema_pdv.sale.dto.CreateSaleRequest;
import dev.mota.sistema_pdv.sale.dto.response.SaleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.UUID;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public SaleResponse create(@Valid @RequestBody CreateSaleRequest request, Authentication authentication) {
        return saleService.create(request, authentication.getName());
    }

    @GetMapping("/{id}")
    public SaleResponse findbyId(@PathVariable UUID id) {
        return saleService.findById(id);
    }

    @PostMapping("/{id}/cancel")
    public SaleResponse cancel(@PathVariable UUID id) {
        return saleService.cancel(id);
    }

}
