package com.TheMFG.HesabimApp.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TheMFG.HesabimApp.dto.AuthResponseDto;
import com.TheMFG.HesabimApp.dto.LoginRequest;
import com.TheMFG.HesabimApp.dto.UserCreateDto;
import com.TheMFG.HesabimApp.entity.RefreshToken;
import com.TheMFG.HesabimApp.entity.User;
import com.TheMFG.HesabimApp.enums.Role;
import com.TheMFG.HesabimApp.repository.UserRepository;
import com.TheMFG.HesabimApp.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final RefreshTokenService refreshTokenService;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public String register(UserCreateDto dto) {
    // Check if email already exists
    if(userRepository.findByEmail(dto.getEmail()).isPresent()){
      throw new RuntimeException("Email already exists");
    }
    
    User user = User.builder()
              .name(dto.getName())
              .surname(dto.getSurname())
              .email(dto.getEmail())
              .password(passwordEncoder.encode(dto.getPassword()))
              .role(Role.USER)
              .build();

    userRepository.save(user);
    return jwtService.generateToken(user.getEmail());
  }

  public AuthResponseDto login(LoginRequest request){
    User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

    if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
      throw new RuntimeException("Invalid Credentials");
    }

    String accessToken = jwtService.generateToken(user.getEmail());

    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

    return new AuthResponseDto(accessToken, refreshToken.getToken());
  }
}
