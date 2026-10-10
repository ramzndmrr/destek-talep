package com.xmid.destek_talep.repository;

import com.xmid.destek_talep.entities.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select rt
            from RefreshToken rt
            where rt.tokenHash = :tokenHash
            """)
    Optional<RefreshToken> findForUpdate(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("""
            update RefreshToken rt
            set rt.revokedAt = :revokedAt
            where rt.user.id = :userId
              and rt.revokedAt is null
            """)
    int revokeAllByUserId(@Param("userId") Long userId,@Param("revokedAt") Instant revokedAt);
}
