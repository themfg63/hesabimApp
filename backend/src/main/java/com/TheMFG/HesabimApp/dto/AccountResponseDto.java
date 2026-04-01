package com.TheMFG.HesabimApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AccountResponseDto {
    private Long id;
    private String accountName;
    private String accountType;
    private String currency;
}