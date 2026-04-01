package com.TheMFG.HesabimApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TheMFG.HesabimApp.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserIdOrderByAccountNameAsc(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);
}