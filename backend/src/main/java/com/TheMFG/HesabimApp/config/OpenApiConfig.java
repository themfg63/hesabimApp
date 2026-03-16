package com.TheMFG.HesabimApp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI hesabimAppOpenAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("HesabimApp API")
            .description("HesabimApp backend API dokümantasyonu")
            .version("v1")
            .contact(new Contact().name("HesabimApp").email("support@hesabimapp.local")));
  }
}
