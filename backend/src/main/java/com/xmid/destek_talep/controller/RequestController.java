package com.xmid.destek_talep.controller;

import com.xmid.destek_talep.dtos.AdminResponse;
import com.xmid.destek_talep.dtos.CreateRequest;
import com.xmid.destek_talep.dtos.RequestResponse;
import com.xmid.destek_talep.dtos.RequestStatusUpdate;
import com.xmid.destek_talep.services.RequestServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestServiceImpl requestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public RequestResponse createRequest(@Valid @RequestBody CreateRequest dto, Authentication authentication) {
        return requestService.createRequest(dto, authentication.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<RequestResponse> getRequests(@RequestParam(required = false) String status, Authentication authentication) {
        // Geçici kontrol amaçlı loglar
        System.out.println("Kullanıcı: " + authentication.getName());
        System.out.println("Yetkiler: " + authentication.getAuthorities());
        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return requestService.getAllRequests(status);
        }
        return requestService.getMyRequests(authentication.getName());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public List<RequestResponse> getMyRequests(Authentication authentication) {
        return requestService.getMyRequests(authentication.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public RequestResponse getRequest(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return requestService.getRequestById(id);
        }

        return requestService.getMyRequest(id, authentication.getName());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RequestResponse> getAllRequests(@RequestParam(required = false) String status) {
        return requestService.getAllRequests(status);
    }

    @PutMapping("/admin/{id}/response")
    @PreAuthorize("hasRole('ADMIN')")
    public RequestResponse respondToRequest(@PathVariable Long id, @Valid @RequestBody AdminResponse request) {
        return requestService.respondToRequest(id, request);
    }

    @PutMapping("/admin/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public RequestResponse closeRequest(@PathVariable Long id, @Valid @RequestBody RequestStatusUpdate request) {
        return requestService.closeRequest(id, request);
    }
}
