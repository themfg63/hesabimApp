package com.TheMFG.HesabimApp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
  
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins(
          "http://localhost:3000",
          "http://192.168.1.106:3000",
          "https://hesabim-app.vercel.app",
          "https://hesabim-app-git-main-themfg63-9294s-projects.vercel.app",
          "https://hesabim-c2djpaltk-themfg63-9294s-projects.vercel.app"
        )
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true)
        .maxAge(3600);
  }
}
