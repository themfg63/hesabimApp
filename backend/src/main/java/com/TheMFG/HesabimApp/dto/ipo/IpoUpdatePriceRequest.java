package com.TheMFG.HesabimApp.dto.ipo;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IpoUpdatePriceRequest {
    private BigDecimal currentPrice;
}