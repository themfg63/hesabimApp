package com.TheMFG.HesabimApp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.TheMFG.HesabimApp.dto.ipo.IpoCreateRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoHeaderDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPortfolioResponseDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPortfolioRowDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPositionCreateRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoSellPositionRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoPositionUpdateRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoSummaryItemDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoUpdatePriceRequest;
import com.TheMFG.HesabimApp.service.IpoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ipos")
@RequiredArgsConstructor
public class IpoController {
    private final IpoService ipoService;

    @GetMapping
    public List<IpoSummaryItemDto> getIpos() {
        return ipoService.getIpos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IpoHeaderDto createIpo(@RequestBody IpoCreateRequest request) {
        return ipoService.createIpo(request);
    }

    @GetMapping("/{ipoId}")
    public IpoPortfolioResponseDto getIpoPortfolio(@PathVariable Long ipoId) {
        return ipoService.getIpoPortfolio(ipoId);
    }

    @GetMapping("/{ipoId}/portfolio-table")
    public IpoPortfolioResponseDto getIpoPortfolioTable(@PathVariable Long ipoId) {
        return ipoService.getIpoPortfolio(ipoId);
    }

    @PatchMapping("/{ipoId}/price")
    public IpoHeaderDto updatePrice(@PathVariable Long ipoId, @RequestBody IpoUpdatePriceRequest request) {
        return ipoService.updatePrice(ipoId, request);
    }

    @PostMapping("/{ipoId}/positions")
    @ResponseStatus(HttpStatus.CREATED)
    public IpoPortfolioRowDto createPosition(@PathVariable Long ipoId, @RequestBody IpoPositionCreateRequest request) {
        return ipoService.createPosition(ipoId, request);
    }

    @PutMapping("/positions/{positionId}")
    public IpoPortfolioRowDto updatePosition(@PathVariable Long positionId, @RequestBody IpoPositionUpdateRequest request) {
        return ipoService.updatePosition(positionId, request);
    }

    @PatchMapping("/positions/{positionId}/sell")
    public IpoPortfolioRowDto sellPosition(@PathVariable Long positionId, @RequestBody IpoSellPositionRequest request) {
        return ipoService.sellPosition(positionId, request);
    }

    @DeleteMapping("/positions/{positionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePosition(@PathVariable Long positionId) {
        ipoService.deletePosition(positionId);
    }
}