package dev.mota.sistema_pdv.sale.mapper;

import org.springframework.stereotype.Component;

import dev.mota.sistema_pdv.sale.Sale;
import dev.mota.sistema_pdv.sale.dto.response.SaleItemResponse;
import dev.mota.sistema_pdv.sale.dto.response.SaleResponse;
import dev.mota.sistema_pdv.sale.dto.response.SaleSummaryResponse;

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
                                sale.getCashReceivedInCents(),
                                sale.getChangeInCents(),
                                sale.getCustomerCpf(),
                                sale.getSeller().getName(),
                                sale.getCreatedAt(),
                                sale.getCanceledAt(),
                                sale.getCanceledBy() == null ? null : sale.getCanceledBy().getName(),
                                sale.getCancellationReason(),
                                sale.getItems().stream()
                                                .map(item -> new SaleItemResponse(
                                                                item.getProduct().getId(),
                                                                item.getProductName(),
                                                                item.getQuantity(),
                                                                item.getUnitPriceInCents(),
                                                                item.getTotalInCents()))
                                                .toList());

        }

        public SaleSummaryResponse toSummary(Sale sale) {
                return new SaleSummaryResponse(
                                sale.getId(),
                                sale.getFormattedNumber(),
                                sale.getStatus().name(),
                                sale.getPaymentMethod().name(),
                                sale.getTotalInCents(),
                                sale.getCreatedAt());
        }
}