package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IpoPortfolioSummaryDto {
    private Integer totalLot;
    private BigDecimal totalCost;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalProfitLoss;
    private String currency;
}