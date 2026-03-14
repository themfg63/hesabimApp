package com.TheMFG.HesabimApp.controller;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TheMFG.HesabimApp.dto.AuthResponseDto;
import com.TheMFG.HesabimApp.dto.LoginRequest;
import com.TheMFG.HesabimApp.dto.RefreshRequestDto;
import com.TheMFG.HesabimApp.dto.UserCreateDto;
import com.TheMFG.HesabimApp.entity.RefreshToken;
import com.TheMFG.HesabimApp.repository.RefreshTokenRepository;
import com.TheMFG.HesabimApp.security.JwtService;
import com.TheMFG.HesabimApp.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;
  private final RefreshTokenRepository refreshTokenRepository;
  private final JwtService jwtService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody UserCreateDto dto){
    try {
      String token = authService.register(dto);
      return ResponseEntity.ok(token);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request){
    try {
      AuthResponseDto response = authService.login(request);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }
  }

  @PostMapping("/refresh")
  public AuthResponseDto refresh(@RequestBody RefreshRequestDto requestDto){
    RefreshToken refreshToken = refreshTokenRepository.findByToken(requestDto.getRefreshToken()).orElseThrow();

    if(refreshToken.getExpiryDate().isBefore(LocalDateTime.now())){
      throw new RuntimeException("Refresh Token Expired");
    }

    String accessToken = jwtService.generateToken(refreshToken.getUser().getEmail());
    
    return new AuthResponseDto(accessToken, refreshToken.getToken());
  }
}
