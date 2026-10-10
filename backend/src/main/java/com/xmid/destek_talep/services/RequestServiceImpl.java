package com.xmid.destek_talep.services;


import com.xmid.destek_talep.dtos.AdminResponse;
import com.xmid.destek_talep.dtos.CreateRequest;
import com.xmid.destek_talep.dtos.RequestResponse;
import com.xmid.destek_talep.dtos.RequestStatusUpdate;
import com.xmid.destek_talep.entities.Request;
import com.xmid.destek_talep.entities.User;
import com.xmid.destek_talep.enums.RequestStatus;
import com.xmid.destek_talep.exception.InvalidRequestException;
import com.xmid.destek_talep.exception.RequestNotFoundException;
import com.xmid.destek_talep.repository.RequestRepository;
import com.xmid.destek_talep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestServiceImpl implements RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RequestResponse createRequest(CreateRequest request, String authenticatedUser) {

        User user = findByEmail(authenticatedUser);

        Request requestEntity = new Request();
        requestEntity.setTitle(request.getTitle().trim());
        requestEntity.setDescription(request.getDescription().trim());
        requestEntity.setCategory(request.getCategory());
        requestEntity.setStatus(RequestStatus.OPEN);
        requestEntity.setUser(user);

        Request savedRequest = requestRepository.save(requestEntity);

        return toResponseDto(savedRequest);
    }

    @Override
    public List<RequestResponse> getMyRequests(String authenticatedUser) {

        User user = findByEmail(authenticatedUser);
        return requestRepository
                .findAllByUserId(user.getId())
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Override
    public RequestResponse getMyRequest(Long requestId, String authenticatedUser) {
        User user = findByEmail(authenticatedUser);
        Request request = requestRepository.findByIdAndUserId(requestId, user.getId()).orElseThrow(() -> new RequestNotFoundException("Talep bulunamadı."));
        return toResponseDto(request);
    }

    @Override
    public List<RequestResponse> getAllRequests(String status) {

        List<Request> requests;

        if (status == null || status.isBlank()) {
            requests = requestRepository.findAllByOrderByCreatedAtDesc();
        } else {
            RequestStatus requestStatus = RequestStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
            requests = requestRepository.findAllByStatusOrderByCreatedAtDesc(requestStatus);
        }

        return requests.stream().map(this::toResponseDto).toList();
    }

    @Override
    @Transactional
    public RequestResponse respondToRequest(Long requestId, AdminResponse request) {

        Request requesEntity = findRequestById(requestId);

        if (requesEntity.getStatus() == RequestStatus.CLOSED) {
            throw new InvalidRequestException("Kapatılmış talebe yanıt verilemez.");
        }
        if (requesEntity.getStatus() == RequestStatus.ANSWERED) {
            throw new InvalidRequestException("Bu talep daha önce yanıtlanmış.");
        }

        requesEntity.setAdminResponse(request.getResponse().trim());
        requesEntity.setStatus(RequestStatus.ANSWERED);

        Request savedRequest = requestRepository.save(requesEntity);

        return toResponseDto(savedRequest);
    }

    @Override
    @Transactional
    public RequestResponse closeRequest(Long requestId, RequestStatusUpdate request) {

        Request requestEntity = findRequestById(requestId);
        if (request.getStatus() != RequestStatus.CLOSED) {
            throw new InvalidRequestException("Talep yalnızca CLOSED durumuna geçirilebilir.");
        }

        if (requestEntity.getStatus() == RequestStatus.CLOSED) {
            throw new InvalidRequestException("Talep zaten kapatılmış.");
        }

        requestEntity.setStatus(RequestStatus.CLOSED);
        Request savedRequest = requestRepository.save(requestEntity);
        return toResponseDto(savedRequest);
    }

    @Override
    public RequestResponse getRequestById(Long requestId) {
        Request request = findRequestById(requestId);
        return toResponseDto(request);
    }


    private User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RequestNotFoundException("Kullanıcı bulunamadı."));
    }

    private Request findRequestById(Long requestId) {
        return requestRepository.findById(requestId).orElseThrow(() -> new RequestNotFoundException("Talep bulunamadı."));
    }

    private RequestResponse toResponseDto(Request request) {
        return new RequestResponse(
                request.getId(),
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getStatus(),
                request.getAdminResponse(),
                request.getUser().getId(),
                request.getCreatedDate()
        );
    }
}
