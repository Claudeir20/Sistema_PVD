package dev.mota.sistema_pdv.sale;

import org.springframework.stereotype.Component;

import dev.mota.sistema_pdv.sale.dto.response.SaleItemResponse;
import dev.mota.sistema_pdv.sale.dto.response.SaleResponse;

@Component
public class SaleMapper {

    public SaleResponse toResponse(Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getFormattedNumber(),
                sale.getStatus().name(),
                sale.getPaymentMethod().name(),
                sale.getSubtotalInCents(),
                sale.getDiscountInCents(),
                sale.getTotalInCents(),
                sale.getCustomerCpf(),
                sale.getSeller().getName(),
                sale.getCreatedAt(),
                sale.getItems().stream()
                        .map(item -> new SaleItemResponse(
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getQuantity(),
                                item.getUnitPriceInCents(),
                                item.getTotalInCents()))
                        .toList());

    }
}
