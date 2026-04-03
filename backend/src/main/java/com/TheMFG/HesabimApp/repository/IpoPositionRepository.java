package com.TheMFG.HesabimApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TheMFG.HesabimApp.entity.IpoPosition;

public interface IpoPositionRepository extends JpaRepository<IpoPosition, Long> {
    List<IpoPosition> findByOfferingIdAndUserIdOrderByAccountAccountNameAsc(Long offeringId, Long userId);

    Optional<IpoPosition> findByIdAndUserId(Long id, Long userId);

    void deleteByOfferingIdAndUserId(Long offeringId, Long userId);

    boolean existsByOfferingIdAndAccountId(Long offeringId, Long accountId);

    boolean existsByOfferingIdAndAccountIdAndIdNot(Long offeringId, Long accountId, Long id);
}