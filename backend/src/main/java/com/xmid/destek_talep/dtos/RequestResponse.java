package com.xmid.destek_talep.dtos;

import com.xmid.destek_talep.enums.RequestCategory;
import com.xmid.destek_talep.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestResponse {
    private Long id;
    private String title;
    private String description;
    private RequestCategory category;
    private RequestStatus status;
    private String adminResponse;
    private Long userId;
    private LocalDateTime createdDate;
}
