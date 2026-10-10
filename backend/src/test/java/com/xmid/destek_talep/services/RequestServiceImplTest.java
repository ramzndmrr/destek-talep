package com.xmid.destek_talep.services;

import com.xmid.destek_talep.dtos.AdminResponse;
import com.xmid.destek_talep.dtos.CreateRequest;
import com.xmid.destek_talep.entities.Request;
import com.xmid.destek_talep.entities.User;
import com.xmid.destek_talep.enums.RequestStatus;
import com.xmid.destek_talep.exception.InvalidRequestException;
import com.xmid.destek_talep.exception.RequestNotFoundException;
import com.xmid.destek_talep.repository.RequestRepository;
import com.xmid.destek_talep.repository.UserRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestServiceImplTest {

    @Mock
    private RequestRepository requestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RequestServiceImpl requestService;

    private static final ValidatorFactory VALIDATOR_FACTORY = Validation.buildDefaultValidatorFactory();

    private final Validator validator = VALIDATOR_FACTORY.getValidator();

    @AfterAll
    static void closeValidatorFactory() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void kullaniciBaskaBirKullaniciyaAitTalebeErisememeli() {

        Long requestId = 13L;
        User user = mock(User.class);
        when(userRepository.findByEmail("user.user@gmail.com")).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(2L);
        when(requestRepository.findByIdAndUserId(requestId, 2L)).thenReturn(Optional.empty());

        assertThrows(RequestNotFoundException.class, () -> requestService.getMyRequest(requestId, "user.user@gmail.com"));

        verify(requestRepository).findByIdAndUserId(requestId, 2L);
    }

    @Test
    void zorunluAlanlariEksikTalepOlusturulamamali() {
        CreateRequest request = new CreateRequest(" ", null, null);

        // Act
        Set<String> invalidFields = validator.validate(request).stream().map(error -> error.getPropertyPath().toString()).collect(Collectors.toSet());
        // Assert
        assertTrue(invalidFields.contains("title"));
        assertTrue(invalidFields.contains("description"));
        assertTrue(invalidFields.contains("category"));
    }

    @Test
    void kapatilmisTalebeYanitVerilememeli() {
        // Arrange
        Long requestId = 13L;

        Request closedRequest = mock(Request.class);
        when(requestRepository.findById(requestId)).thenReturn(Optional.of(closedRequest));
        when(closedRequest.getStatus()).thenReturn(RequestStatus.CLOSED);
        AdminResponse response = mock(AdminResponse.class);

        assertThrows(InvalidRequestException.class, () -> requestService.respondToRequest(requestId, response));
        // Kapalı talebe yanıt kaydedilmemeli.
        verify(requestRepository, never()).save(any(Request.class));
    }
}
