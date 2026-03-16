package com.TheMFG.HesabimApp.security;

import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.TheMFG.HesabimApp.entity.User;
import com.TheMFG.HesabimApp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{
  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String email){
    User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found!"));

    String[] roles = user.getRoles() == null
        ? new String[0]
        : user.getRoles().stream()
            .map(role -> role.getName().replace("ROLE_", ""))
            .collect(Collectors.toSet())
            .toArray(new String[0]);

    return org.springframework.security.core.userdetails.User
      .withUsername(user.getEmail())
      .password(user.getPassword())
      .roles(roles)
      .build();
  }
}
