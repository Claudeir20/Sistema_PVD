package dev.mota.sistema_pdv.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SpaController.class)
@Import(SecurityConfig.class)
class LogoutTest {

    @Autowired
    MockMvc mvc;

    @Test
    @WithMockUser
    void logoutReturns204InvalidatesTheSessionAndDeletesTheCookie() throws Exception {
        MockHttpSession session = new MockHttpSession();

        mvc.perform(post("/api/auth/logout").with(csrf()).session(session))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("PVD_SESSION", 0));

        assertThat(session.isInvalid()).isTrue();
    }
}
