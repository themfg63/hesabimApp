package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IpoCreateRequest {
    private String code;
    private String companyName;
    private BigDecimal offeringPrice;
    private BigDecimal currentPrice;
    private String currency;
}