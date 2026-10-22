package dev.mota.sistema_pdv.sale.dto;

import dev.mota.sistema_pdv.sale.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

/** Só id e quantidade de cada item: preço, nome e totais o backend calcula. */
public record CreateSaleRequest(
        @NotEmpty(message = "A venda precisa ter pelo menos um item.")
        List<@Valid SaleItemRequest> items,

        @NotNull(message = "Informe o desconto (0 se não houver).")
        @PositiveOrZero(message = "O desconto não pode ser negativo.")
        Long discountInCents,

        @NotNull(message = "Informe a forma de pagamento.")
        PaymentMethod paymentMethod,

        /** Opcional: CPF na nota. */
        String customerCpf
) {}