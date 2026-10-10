package com.xmid.destek_talep.services;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.xmid.destek_talep.dtos.*;
import com.xmid.destek_talep.entities.RefreshToken;
import com.xmid.destek_talep.dtos.RefreshTokenRequest;
import com.xmid.destek_talep.entities.User;
import com.xmid.destek_talep.exception.ApiException;
import com.xmid.destek_talep.repository.RefreshTokenRepository;
import com.xmid.destek_talep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    private final SecureRandom secureRandom = new SecureRandom();

    private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 30;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setUserName(request.userName());
        user.setRole("ADMIN");
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        userRepository.save(user);
        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.password()
                    )
            );
        } catch (BadCredentialsException exception) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {

        GoogleIdToken googleIdToken;

        try {
            googleIdToken = googleIdTokenVerifier.verify(request.idToken());
        } catch (Exception exception) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Google ID token: " + exception.getMessage()
            );
        }

        if (googleIdToken == null) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Google ID token"
            );
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Google email is not verified"
            );
        }

        String googleSubject = payload.getSubject();
        String email = normalizeEmail(payload.getEmail());

        // Önce Google hesabı daha önce bağlanmış mı?
        User user = userRepository
                .findByGoogleSubject(googleSubject)
                .orElse(null);

        if (user == null) {

            // Google hesabı bağlı değilse email üzerinden mevcut kullanıcıyı ara
            user = userRepository
                    .findByEmail(email)
                    .orElse(null);

            if (user != null) {

                // Mevcut kullanıcıyı Google hesabına bağla
                user.setGoogleSubject(googleSubject);

                userRepository.save(user);

            } else {

                // Hiç kullanıcı yoksa yeni kullanıcı oluştur
                user = new User();

                user.setEmail(email);
                user.setGoogleSubject(googleSubject);
                user.setEnabled(true);

                userRepository.save(user);
            }
        }

        if (!user.isEnabled()) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "User account is disabled"
            );
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {

        String tokenHash = hashToken(request.refreshToken());

        RefreshToken refreshToken = refreshTokenRepository.findForUpdate(tokenHash).orElseThrow(() ->
                                new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {

            refreshToken.revoke();
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token has expired");
        }

        User user = refreshToken.getUser();

        if (!user.isEnabled()) {
            throw new ApiException( HttpStatus.FORBIDDEN,"User account is disabled");
        }

        /*
         * Refresh token rotation.
         *
         * Eski token artık tekrar kullanılamaz.
         */
        refreshToken.revoke();
        return createAuthResponse(user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId,Instant.now());
    }

    @Transactional
    public void linkGoogle(Long userId, GoogleLoginRequest request) {

        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        GoogleIdToken googleIdToken;

        try {
            googleIdToken = googleIdTokenVerifier.verify(request.idToken());

        } catch (Exception exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
        }

        if (googleIdToken == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }

        String googleSubject = payload.getSubject();
        String googleEmail = normalizeEmail(payload.getEmail());

        if (!user.getEmail().equalsIgnoreCase(googleEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Google email does not match the current account"
            );
        }

        User anotherUser = userRepository.findByGoogleSubject(googleSubject).orElse(null);

        if (anotherUser != null && !anotherUser.getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "This Google account is already linked to another user");
        }

        user.setGoogleSubject(googleSubject);
        userRepository.save(user);
    }

    private AuthResponse createAuthResponse(User user) {

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);


        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUserName(),
                user.getRole()
        );
        return new AuthResponse(accessToken, refreshToken, "Bearer", jwtService.getAccessTokenExpiration(),userResponse);
    }

    private String createRefreshToken(User user) {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(rawToken));
        refreshToken.setExpiresAt(Instant.now().plus(REFRESH_TOKEN_EXPIRATION_DAYS, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is not available", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}