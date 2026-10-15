package dev.mota.sistema_pdv.product;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.mota.sistema_pdv.product.dto.CreateProductRequest;
import dev.mota.sistema_pdv.product.dto.ProductResponse;
import dev.mota.sistema_pdv.product.dto.UpdateProductRequest;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    ProductService productService;

    private static final UUID ID = UUID.fromString("3f2a9c1e-0000-4000-8000-000000000001");

    /** Resposta pronta para o service falso devolver. Mude o estoque conforme o teste. */
    private static ProductResponse cable(int stockQuantity) {
        Instant now = Instant.parse("2026-10-14T12:00:00Z");
        return new ProductResponse(ID, "7891000000011", "Cabo USB-C", 2990L, stockQuantity, 5, true, 0L, now, now);
    }

    private static ProductResponse cable2V(boolean active) {
        Instant now = Instant.parse("2026-10-14T12:00:00Z");
        return new ProductResponse(ID, "7891000000011",  "Cabo USB-C", 2990L,10 , 5, active, 0L, now, now  );
    }

    @Test
    void createReturns201WithTheProduct() throws Exception {
        // 1. COMBINAR: quando o controller chamar o service, ele devolve este produto
        when(productService.create(any())).thenReturn(cable(0));

        // 2. REQUISITAR: o POST que o frontend faria
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barcode": "7891000000011", "name": "Cabo USB-C", "priceInCents": 2990, "minStock": 5}
                                """))
                // 3. CONFERIR A RESPOSTA: status 201 e os campos do JSON
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ID.toString()))
                .andExpect(jsonPath("$.name").value("Cabo USB-C"))
                .andExpect(jsonPath("$.priceInCents").value(2990));

        // 4. CONFERIR A CHAMADA: o JSON virou exatamente este DTO e chegou ao service
        verify(productService).create(new CreateProductRequest("7891000000011", "Cabo USB-C", 2990L, 5));
    }

    @Test
    void findAll() throws Exception {

        when(productService.findAllActive()).thenReturn(List.of(cable(0), cable(1)));

        mvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ID.toString()))
                .andExpect(jsonPath("$[0].name").value("Cabo USB-C"))
                .andExpect(jsonPath("$[0].priceInCents").value(2990));
        verify(productService).findAllActive();
    }

    @Test
    void findById() throws Exception {

        when(productService.findProductById(any())).thenReturn(cable(0));

        mvc.perform(get("/api/products/{id}", ID))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.id").value(ID.toString()))
                        .andExpect(jsonPath("$.name").value("Cabo USB-C"))
                        .andExpect(jsonPath("$.priceInCents").value(2990));


        verify(productService).findProductById(ID);


    }

    @Test
    void updateSendsIdAndDataToTheService() throws Exception {

        when(productService.update(any(), any())).thenReturn(cable(0));


        mvc.perform(put("/api/products/{id}", ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Cabo USB-C 2 m", "priceInCents": 1990, "minStock": 8, "version": 0}
                                """))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ID.toString()))
                .andExpect(jsonPath("$.priceInCents").value(2990));


        verify(productService).update(ID, new UpdateProductRequest("Cabo USB-C 2 m", 1990L, 8, 0L));
    }

    @Test
    void restockSendsTheQuantityToTheService() throws Exception {

        when(productService.restock(any(), anyInt())).thenReturn(cable(10));

        mvc.perform(post("/api/products/{id}/restock", ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        
                        {"quantity": 10}
                        
                        """)

        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ID.toString()))
                .andExpect(jsonPath("$.stockQuantity").value(10));
        verify(productService).restock(ID, 10);


    }

    @Test
    void archiveReturnsTheInactiveProduct() throws Exception {

        when(productService.archive(any())).thenReturn(cable2V(false));

        mvc.perform(post("/api/products/{id}/archive", ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ID.toString()))
                .andExpect(jsonPath("$.active").value(false));
        verify(productService).archive(ID);
    }

    @Test
    void reactivateReturnsTheActiveProduct() throws  Exception {
        when(productService.reactivate(any())).thenReturn(cable2V(true));

        mvc.perform(post("/api/products/{id}/reactivate", ID))
                .andExpect(status().isOk())
                .andExpect((jsonPath("$.id").value((ID.toString()))))
                .andExpect(jsonPath("$.active").value(true));

        verify(productService).reactivate(ID);

    }
}
