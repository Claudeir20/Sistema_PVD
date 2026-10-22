package dev.mota.sistema_pdv.sale;

import dev.mota.sistema_pdv.movements.StockMovement;
import dev.mota.sistema_pdv.movements.StockMovementType;
import dev.mota.sistema_pdv.product.Product;
import dev.mota.sistema_pdv.product.ProductRepository;
import dev.mota.sistema_pdv.product.exception.ProductNotFoundException;
import dev.mota.sistema_pdv.sale.dto.CreateSaleRequest;
import dev.mota.sistema_pdv.sale.dto.SaleItemRequest;
import dev.mota.sistema_pdv.sale.dto.response.SaleResponse;
import dev.mota.sistema_pdv.sale.exception.SaleNotFoundException;
import dev.mota.sistema_pdv.user.User;
import dev.mota.sistema_pdv.user.UserRepository;
import dev.mota.sistema_pdv.user.exception.UserNotFoundException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registra e cancela vendas. Tudo numa transação: se um item falhar (sem estoque,
 * arquivado, alterado por outro caixa), nada é gravado.
 */
@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SaleMapper saleMapper;

    /** O vendedor vem da sessão (e-mail do logado), nunca do JSON. */
    @Transactional
    public SaleResponse create(CreateSaleRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow(UserNotFoundException::new);

        long number = saleRepository.nextNumber();
        StockMovement movement = StockMovement.create(
                StockMovementType.SALE, "Venda " + Sale.formatNumber(number));

        Sale sale = Sale.create(number, seller, request.paymentMethod(), request.customerCpf(), movement);

        mergeQuantities(request.items()).forEach((productId, quantity) ->
                sale.addItem(findProduct(productId), quantity));

        // Depois dos itens: o desconto é conferido contra o subtotal já calculado.
        sale.applyDiscount(request.discountInCents());
        sale.requireItems();

        return saleMapper.toResponse(saleRepository.saveAndFlush(sale));
    }

    @Transactional(readOnly = true)
    public SaleResponse findById(UUID saleId) {
        return saleMapper.toResponse(findSale(saleId));
    }

    @Transactional
    public SaleResponse cancel(UUID saleId) {
        Sale sale = findSale(saleId);

        StockMovement cancellation = StockMovement.create(
                StockMovementType.SALE_CANCELLATION, "Cancelamento da venda " + sale.getFormattedNumber());
        sale.cancel(cancellation);

        return saleMapper.toResponse(saleRepository.saveAndFlush(sale));
    }

    /** O mesmo produto duas vezes na lista vira um item só, com as quantidades somadas. */
    private Map<UUID, Integer> mergeQuantities(List<SaleItemRequest> items) {
        Map<UUID, Integer> quantities = new LinkedHashMap<>(); // mantém a ordem do carrinho
        for (SaleItemRequest item : items) {
            quantities.merge(item.productId(), item.quantity(), Math::addExact);
        }
        return quantities;
    }

    private Product findProduct(UUID productId) {
        return productRepository.findById(productId).orElseThrow(ProductNotFoundException::new);
    }

    private Sale findSale(UUID saleId) {
        return saleRepository.findById(saleId).orElseThrow(SaleNotFoundException::new);
    }
}