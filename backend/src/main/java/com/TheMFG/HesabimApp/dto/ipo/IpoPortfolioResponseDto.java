package com.TheMFG.HesabimApp.dto.ipo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IpoPortfolioResponseDto {
    private IpoHeaderDto ipo;
    private List<IpoPortfolioRowDto> rows;
    private IpoPortfolioSummaryDto summary;
}