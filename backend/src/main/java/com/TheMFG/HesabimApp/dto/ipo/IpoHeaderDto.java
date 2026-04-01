package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IpoHeaderDto {
    private Long id;
    private String code;
    private String companyName;
    private BigDecimal offeringPrice;
    private BigDecimal currentPrice;
    private String currency;
    private String status;
}