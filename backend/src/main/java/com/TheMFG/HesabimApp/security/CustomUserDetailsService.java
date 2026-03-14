package com.TheMFG.HesabimApp.security;

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

    return org.springframework.security.core.userdetails.User
      .withUsername(user.getEmail())
      .password(user.getPassword())
      .roles(user.getRole().toString())
      .build();
  }
}
