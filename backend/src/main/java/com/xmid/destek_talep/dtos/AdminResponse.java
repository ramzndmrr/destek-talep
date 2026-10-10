package com.xmid.destek_talep.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminResponse {
    @NotBlank(message = "Admin yanıtı boş olamaz.")
    @Size(max = 5000, message = "Yanıt en fazla 5000 karakter olabilir.")
    private String response;
}
