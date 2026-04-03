package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IpoPortfolioSummaryDto {
    private Integer totalRequestedLot;
    private Integer totalPurchasedLot;
    private BigDecimal totalCost;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal totalPendingCash;
    private String currency;
}