package com.TheMFG.HesabimApp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateDto {
  private String name;
  private String surname;
  private String email;
  private String password;
}
