package com.xmid.destek_talep.dtos;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserResponse user) {
}
