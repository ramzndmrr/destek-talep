package com.xmid.destek_talep.entities;

import com.xmid.destek_talep.enums.RequestCategory;
import com.xmid.destek_talep.enums.RequestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
@Getter
@Setter
@NoArgsConstructor
public class Request extends BaseEntity{

    @NotBlank(message = "Talep başlığı boş olamaz.")
    @Size(max = 150, message = "Talep başlığı en fazla 150 karakter olabilir.")
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Talep açıklaması boş olamaz.")
    @Size(max = 5000, message = "Talep açıklaması en fazla 5000 karakter olabilir.")
    @Column(nullable = false, length = 5000)
    private String description;

    @NotNull(message = "Talep kategorisi zorunludur.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RequestCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.OPEN;

    @Column(name = "admin_response", length = 5000)
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}