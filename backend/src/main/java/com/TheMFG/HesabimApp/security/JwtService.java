package com.TheMFG.HesabimApp.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {
  @Value("${jwt.secret}")
  private String SECRET_KEY;

  public String generateToken(String email){
    return Jwts.builder()
              .setSubject(email)
              .setIssuedAt(new Date())
              .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
              .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
              .compact();
  }

  public String extractEmail(String token){
    return Jwts.parser()
            .setSigningKey(SECRET_KEY)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
  }
}
