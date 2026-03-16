package com.TheMFG.HesabimApp.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseSchemaInitializer {

  @Bean
  CommandLineRunner initializeSchema(JdbcTemplate jdbcTemplate) {
    return args -> {
      try {
        // users tablosu yeni User entity alanlarıyla uyumlu olsun
        jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE");
        jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP");

        jdbcTemplate.execute("UPDATE users SET active = TRUE WHERE active IS NULL");
        jdbcTemplate.execute("UPDATE users SET created_at = NOW() WHERE created_at IS NULL");

        // Role tablosu ve user_roles eşleme tablosu yeni role modeli için gerekli
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS roles (
              id BIGSERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE
            )
            """);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS user_roles (
              user_id BIGINT NOT NULL,
              role_id BIGINT NOT NULL,
              PRIMARY KEY (user_id, role_id),
              CONSTRAINT fk_user_roles_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              CONSTRAINT fk_user_roles_role
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            )
            """);

        jdbcTemplate.execute("INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT (name) DO NOTHING");

        // Eski kullanıcıları varsayılan ROLE_USER ile eşle
        jdbcTemplate.execute("""
            INSERT INTO user_roles (user_id, role_id)
            SELECT u.id, r.id
            FROM users u
            JOIN roles r ON r.name = 'ROLE_USER'
            WHERE NOT EXISTS (
              SELECT 1
              FROM user_roles ur
              WHERE ur.user_id = u.id AND ur.role_id = r.id
            )
            """);

        log.info("Database schema initialized for User(active, created_at, roles).");
      } catch (Exception ex) {
        log.error("Database schema initialization failed: {}", ex.getMessage(), ex);
      }
    };
  }
}
