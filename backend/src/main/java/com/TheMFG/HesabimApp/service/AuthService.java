package com.TheMFG.HesabimApp.service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TheMFG.HesabimApp.dto.AuthResponseDto;
import com.TheMFG.HesabimApp.dto.LoginRequest;
import com.TheMFG.HesabimApp.dto.UserCreateDto;
import com.TheMFG.HesabimApp.entity.RefreshToken;
import com.TheMFG.HesabimApp.entity.Role;
import com.TheMFG.HesabimApp.entity.User;
import com.TheMFG.HesabimApp.repository.RoleRepository;
import com.TheMFG.HesabimApp.repository.UserRepository;
import com.TheMFG.HesabimApp.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final RefreshTokenService refreshTokenService;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  @SuppressWarnings("null")
  public AuthResponseDto register(UserCreateDto dto) {
    if (userRepository.existsByEmail(dto.getEmail())) {
      throw new RuntimeException("Email already exists");
    }

    Role defaultRole = getOrCreateDefaultRole();

    String fullName = dto.getName();
    if (dto.getSurname() != null && !dto.getSurname().isBlank()) {
      fullName = dto.getName() + " " + dto.getSurname().trim();
    }
    
    User user = User.builder()
              .name(fullName)
              .email(dto.getEmail())
              .password(passwordEncoder.encode(dto.getPassword()))
              .active(true)
              .createdAt(LocalDateTime.now())
              .roles(Set.of(defaultRole))
              .build();

    User savedUser = Objects.requireNonNull(userRepository.save(user));
    
    String accessToken = jwtService.generateToken(savedUser.getEmail());
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);
    
    return new AuthResponseDto(accessToken, refreshToken.getToken());
  }

  @SuppressWarnings("null")
  public AuthResponseDto login(LoginRequest request){
    User user = userRepository
        .findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
      throw new RuntimeException("Invalid Credentials");
    }

    boolean needsUpdate = false;

    // Eski kayıtlarda alanlar boş/false gelebilir; ilk login'de uyumlandır.
    if (!user.isActive()) {
      user.setActive(true);
      needsUpdate = true;
    }

    if (user.getCreatedAt() == null) {
      user.setCreatedAt(LocalDateTime.now());
      needsUpdate = true;
    }

    if (user.getRoles() == null || user.getRoles().isEmpty()) {
      user.setRoles(Set.of(getOrCreateDefaultRole()));
      needsUpdate = true;
    }

    if (needsUpdate) {
      user = Objects.requireNonNull(userRepository.save(user));
    }

    String accessToken = jwtService.generateToken(user.getEmail());

    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

    return new AuthResponseDto(accessToken, refreshToken.getToken());
  }

  @SuppressWarnings("null")
  private Role getOrCreateDefaultRole() {
    Role defaultRole = roleRepository.findByName("ROLE_USER").orElse(null);
    if (defaultRole == null) {
      defaultRole = Objects.requireNonNull(roleRepository.save(Role.builder().name("ROLE_USER").build()));
    }
    return defaultRole;
  }
}
