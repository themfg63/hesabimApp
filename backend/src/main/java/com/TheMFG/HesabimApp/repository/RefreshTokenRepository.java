package com.TheMFG.HesabimApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.TheMFG.HesabimApp.entity.RefreshToken;
import com.TheMFG.HesabimApp.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long>{
  Optional<RefreshToken> findByToken(String token);
  
  @Transactional
  @Modifying
  void deleteByUser(User user);
}