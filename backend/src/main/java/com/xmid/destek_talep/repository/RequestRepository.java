package com.xmid.destek_talep.repository;
import com.xmid.destek_talep.entities.Request;
import com.xmid.destek_talep.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Long> {

    @Query("""
    SELECT r
    FROM Request r
    WHERE r.user.id = :userId
    ORDER BY r.createdDate DESC
    """)
    List<Request> findAllByUserId(@Param("userId") Long userId);

    @Query("""
    SELECT r
    FROM Request r
    WHERE r.id = :requestId
      AND r.user.id = :userId
    """)
    Optional<Request> findByIdAndUserId(@Param("requestId") Long requestId, @Param("userId") Long userId);

    @Query("""
    SELECT r
    FROM Request r
    ORDER BY r.createdDate DESC
    """)
    List<Request> findAllByOrderByCreatedAtDesc();

    @Query("""
    SELECT r
    FROM Request r
    WHERE r.status = :status
    ORDER BY r.createdDate DESC
    """)
    List<Request> findAllByStatusOrderByCreatedAtDesc(@Param("status") RequestStatus status);

}