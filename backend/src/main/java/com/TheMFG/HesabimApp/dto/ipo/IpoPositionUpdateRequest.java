package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IpoPositionUpdateRequest {
    private Long accountId;
    private Integer lotCount;
    private BigDecimal buyPrice;
    private LocalDateTime buyDate;
    private String notes;
}