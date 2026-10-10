package com.xmid.destek_talep.dtos;

import com.xmid.destek_talep.enums.RequestCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateRequest {

    @NotBlank(message = "Başlık zorunludur.")
    @Size(max = 150, message = "Başlık en fazla 150 karakter olabilir.")
    private String title;

    @NotBlank(message = "Açıklama zorunludur.")
    @Size(max = 5000, message = "Açıklama en fazla 5000 karakter olabilir.")
    private String description;

    @NotNull(message = "Kategori seçilmelidir.")
    private RequestCategory category;
}
