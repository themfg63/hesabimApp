package com.TheMFG.HesabimApp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountCreateRequest {
    private String accountName;
    private String accountType;
    private String currency;
}