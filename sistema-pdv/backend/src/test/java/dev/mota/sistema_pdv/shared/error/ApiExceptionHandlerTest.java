package dev.mota.sistema_pdv.shared.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Garante o formato {"message"} e os códigos 400/404/409 para toda a API. */
class ApiExceptionHandlerTest {

    MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new SampleController())
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void businessRuleReturns400() throws Exception {
        mvc.perform(get("/sample/bad-request"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Estoque insuficiente."));
    }

    @Test
    void invalidFieldReturns400WithFieldMessage() throws Exception {
        mvc.perform(post("/sample/validated").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Informe o nome."));
    }

    @Test
    void malformedJsonReturns400() throws Exception {
        mvc.perform(post("/sample/validated").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dados inválidos. Confira os campos enviados."));
    }

    @Test
    void missingRecordReturns404() throws Exception {
        mvc.perform(get("/sample/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Produto não encontrado."));
    }

    @Test
    void conflictReturns409() throws Exception {
        mvc.perform(get("/sample/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Já existe um produto com esse código de barras."));
    }

    @RestController
    static class SampleController {

        @GetMapping("/sample/bad-request")
        void badRequest() {
            throw new IllegalArgumentException("Estoque insuficiente.");
        }

        @GetMapping("/sample/not-found")
        void notFound() {
            throw new NotFoundException("Produto não encontrado.");
        }

        @GetMapping("/sample/conflict")
        void conflict() {
            throw new ConflictException("Já existe um produto com esse código de barras.");
        }

        @PostMapping("/sample/validated")
        void validated(@Valid @RequestBody SampleRequest request) {}
    }

    record SampleRequest(@NotBlank(message = "Informe o nome.") String name) {}
}
