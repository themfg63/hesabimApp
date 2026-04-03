package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IpoPositionCreateRequest {
    private Long accountId;
    private Integer requestedLotCount;
    private Integer purchasedLotCount;
    private BigDecimal buyPrice;
    private LocalDateTime buyDate;
    private String notes;
}