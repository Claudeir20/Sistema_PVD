package dev.mota.sistema_pdv.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 

public class SpaController {

    @GetMapping({ "/login", "/painel", "/vender", "/os/**", "/acompanhar/**" })
    public String index(){
        return "forward:/index.html";
    }
    
}
