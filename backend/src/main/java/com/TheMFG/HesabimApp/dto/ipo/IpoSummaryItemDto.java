package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IpoSummaryItemDto {
    private Long id;
    private String code;
    private String companyName;
    private BigDecimal offeringPrice;
    private BigDecimal currentPrice;
    private Integer totalRequestedLot;
    private Integer totalPurchasedLot;
    private BigDecimal totalCost;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal totalPendingCash;
    private Boolean fullySold;
    private Integer positionCount;
    private String currency;
}