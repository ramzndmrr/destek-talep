package com.xmid.destek_talep.services;

import com.xmid.destek_talep.dtos.AdminResponse;
import com.xmid.destek_talep.dtos.CreateRequest;
import com.xmid.destek_talep.dtos.RequestResponse;
import com.xmid.destek_talep.dtos.RequestStatusUpdate;

import java.util.List;

public interface RequestService {

    RequestResponse createRequest(CreateRequest request, String authenticatedUser);

    List<RequestResponse> getMyRequests(String authenticatedUser);

    RequestResponse getMyRequest(Long requestId, String authenticatedUser);

    List<RequestResponse> getAllRequests(String status);

    RequestResponse respondToRequest(Long requestId, AdminResponse dto);

    RequestResponse closeRequest(Long requestId, RequestStatusUpdate dto);
    RequestResponse getRequestById(Long requestId);
}