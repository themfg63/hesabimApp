package com.TheMFG.HesabimApp.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.TheMFG.HesabimApp.entity.RefreshToken;
import com.TheMFG.HesabimApp.entity.User;
import com.TheMFG.HesabimApp.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
  private final RefreshTokenRepository repository;

  public RefreshToken createRefreshToken(User user){
    // Kullanıcının eski refresh token'larını sil
    repository.deleteByUser(user);
    
    // Yeni refresh token oluştur
    RefreshToken token = new RefreshToken();
    token.setUser(user);
    token.setToken(UUID.randomUUID().toString());
    token.setExpiryDate(LocalDateTime.now().plusDays(7));
    return repository.save(token);
  }
}
