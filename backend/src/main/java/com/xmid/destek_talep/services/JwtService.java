package com.xmid.destek_talep.services;


import com.xmid.destek_talep.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;

    @Value("${spring.jwt.issuer}")
    private String issuer;

    @Value("${spring.jwt.audience}")
    private String audience;

    @Value("${spring.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    public String generateAccessToken(User user) {

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(user.getEmail())
                .audience(List.of(audience))
                .issuedAt(now)
                .expiresAt(now.plusSeconds(accessTokenExpiration))
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}