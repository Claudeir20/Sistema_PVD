package dev.mota.sistema_pdv.product.dto;

import java.util.ListIterator;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;;

public record ImportProductsRequest(
    @NotEmpty (message = "O arquivo não tem produtos")
    @Size (max = 1000, message = "Importe no máximo 1000 produtos por vez")
    List<@Valid ImportProductItem> products){}

