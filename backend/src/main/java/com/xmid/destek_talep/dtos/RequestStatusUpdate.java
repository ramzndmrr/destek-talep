package com.xmid.destek_talep.dtos;

import com.xmid.destek_talep.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestStatusUpdate {
    @NotNull(message = "Talep durumu zorunludur.")
    private RequestStatus status;
}
