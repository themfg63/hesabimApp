package com.TheMFG.HesabimApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TheMFG.HesabimApp.entity.IpoOffering;

public interface IpoOfferingRepository extends JpaRepository<IpoOffering, Long> {
    List<IpoOffering> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<IpoOffering> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndCodeIgnoreCase(Long userId, String code);
}