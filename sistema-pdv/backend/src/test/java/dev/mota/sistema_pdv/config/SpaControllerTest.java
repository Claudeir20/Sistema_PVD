package dev.mota.sistema_pdv.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SpaController.class)
@Import(SecurityConfig.class)
class SpaControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void reactRoutesReturnTheIndexWithoutLogin() throws Exception {
        for (String path : new String[] { "/login", "/painel", "/vender" }) {
            mvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/index.html"));
        }
    }

    @Test
    void unknownApiRouteIsNotSwallowedByTheReact() throws Exception {
        // Sem login, /api/** responde 401 em JSON, não o index.html.
        mvc.perform(get("/api/nao-existe"))
                .andExpect(status().isUnauthorized());
    }
}