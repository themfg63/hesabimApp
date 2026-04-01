package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IpoPortfolioRowDto {
    private Long positionId;
    private Long accountId;
    private String accountName;
    private String accountType;
    private String positionStatus;
    private Boolean sold;
    private Integer lotCount;
    private BigDecimal buyPrice;
    private BigDecimal salePrice;
    private BigDecimal currentPrice;
    private BigDecimal totalCost;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private java.time.LocalDateTime soldAt;
    private String currency;
}