package com.TheMFG.HesabimApp.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TheMFG.HesabimApp.dto.ipo.IpoCreateRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoHeaderDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPortfolioResponseDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPortfolioRowDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPortfolioSummaryDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoPositionCreateRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoSellPositionRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoPositionUpdateRequest;
import com.TheMFG.HesabimApp.dto.ipo.IpoSummaryItemDto;
import com.TheMFG.HesabimApp.dto.ipo.IpoUpdatePriceRequest;
import com.TheMFG.HesabimApp.entity.Account;
import com.TheMFG.HesabimApp.entity.IpoOffering;
import com.TheMFG.HesabimApp.entity.IpoPosition;
import com.TheMFG.HesabimApp.entity.User;
import com.TheMFG.HesabimApp.repository.AccountRepository;
import com.TheMFG.HesabimApp.repository.IpoOfferingRepository;
import com.TheMFG.HesabimApp.repository.IpoPositionRepository;
import com.TheMFG.HesabimApp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IpoService {
    private final IpoOfferingRepository ipoOfferingRepository;
    private final IpoPositionRepository ipoPositionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<IpoSummaryItemDto> getIpos() {
        User currentUser = getCurrentUser();

        return ipoOfferingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
            .map(this::toSummaryItem)
            .toList();
    }

    @Transactional
    public IpoHeaderDto createIpo(IpoCreateRequest request) {
        User currentUser = getCurrentUser();
        String code = normalizeCode(request.getCode());

        if (code == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arz kodu zorunludur");
        }
        if (request.getOfferingPrice() == null || request.getOfferingPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arz fiyati gecersiz");
        }

        BigDecimal currentPrice = request.getCurrentPrice() == null ? request.getOfferingPrice() : request.getCurrentPrice();
        if (currentPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guncel fiyat gecersiz");
        }
        if (ipoOfferingRepository.existsByUserIdAndCodeIgnoreCase(currentUser.getId(), code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu arz kodu zaten mevcut");
        }

        LocalDateTime now = LocalDateTime.now();
        IpoOffering offering = IpoOffering.builder()
            .user(currentUser)
            .code(code)
            .companyName(sanitize(request.getCompanyName()))
            .offeringPrice(request.getOfferingPrice())
            .currentPrice(currentPrice)
            .currency(normalizeCurrency(request.getCurrency()))
            .status("ACTIVE")
            .createdAt(now)
            .updatedAt(now)
            .build();

        return toHeader(ipoOfferingRepository.save(offering));
    }

    public IpoPortfolioResponseDto getIpoPortfolio(Long ipoId) {
        User currentUser = getCurrentUser();
        IpoOffering offering = getOwnedOffering(ipoId, currentUser.getId());
        List<IpoPosition> positions = ipoPositionRepository.findByOfferingIdAndUserIdOrderByAccountAccountNameAsc(offering.getId(), currentUser.getId());

        List<IpoPortfolioRowDto> rows = positions.stream()
            .map(position -> toRow(position, offering.getCurrentPrice(), offering.getCurrency()))
            .toList();

        return IpoPortfolioResponseDto.builder()
            .ipo(toHeader(offering))
            .rows(rows)
            .summary(toSummary(rows, offering.getCurrency()))
            .build();
    }

    @Transactional
    public IpoHeaderDto updatePrice(Long ipoId, IpoUpdatePriceRequest request) {
        User currentUser = getCurrentUser();
        IpoOffering offering = getOwnedOffering(ipoId, currentUser.getId());

        if (request.getCurrentPrice() == null || request.getCurrentPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guncel fiyat gecersiz");
        }

        offering.setCurrentPrice(request.getCurrentPrice());
        offering.setUpdatedAt(LocalDateTime.now());

        return toHeader(ipoOfferingRepository.save(offering));
    }

    @Transactional
    public IpoPortfolioRowDto createPosition(Long ipoId, IpoPositionCreateRequest request) {
        User currentUser = getCurrentUser();
        IpoOffering offering = getOwnedOffering(ipoId, currentUser.getId());
        Account account = getOwnedAccount(request.getAccountId(), currentUser.getId());

        if (ipoPositionRepository.existsByOfferingIdAndAccountId(offering.getId(), account.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu hesap icin satir zaten mevcut");
        }

        IpoPosition position = buildPosition(null, offering, account, currentUser, request.getLotCount(), request.getBuyPrice(), request.getBuyDate(), request.getNotes());
        IpoPosition savedPosition = ipoPositionRepository.save(position);

        return toRow(savedPosition, offering.getCurrentPrice(), offering.getCurrency());
    }

    @Transactional
    public IpoPortfolioRowDto updatePosition(Long positionId, IpoPositionUpdateRequest request) {
        User currentUser = getCurrentUser();
        IpoPosition existingPosition = ipoPositionRepository.findByIdAndUserId(positionId, currentUser.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pozisyon bulunamadi"));

        Account account = request.getAccountId() == null
            ? existingPosition.getAccount()
            : getOwnedAccount(request.getAccountId(), currentUser.getId());

        if (ipoPositionRepository.existsByOfferingIdAndAccountIdAndIdNot(existingPosition.getOffering().getId(), account.getId(), existingPosition.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu hesap icin satir zaten mevcut");
        }

        IpoPosition updatedPosition = buildPosition(
            existingPosition,
            existingPosition.getOffering(),
            account,
            currentUser,
            request.getLotCount() == null ? existingPosition.getLotCount() : request.getLotCount(),
            request.getBuyPrice() == null ? existingPosition.getBuyPrice() : request.getBuyPrice(),
            request.getBuyDate() == null ? existingPosition.getBuyDate() : request.getBuyDate(),
            request.getNotes() == null ? existingPosition.getNotes() : request.getNotes()
        );

        if ("SOLD".equalsIgnoreCase(updatedPosition.getPositionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Satilan pozisyon duzenlenemez");
        }

        IpoPosition savedPosition = ipoPositionRepository.save(updatedPosition);
        return toRow(savedPosition, savedPosition.getOffering().getCurrentPrice(), savedPosition.getOffering().getCurrency());
    }

    @Transactional
    public IpoPortfolioRowDto sellPosition(Long positionId, IpoSellPositionRequest request) {
        User currentUser = getCurrentUser();
        IpoPosition position = ipoPositionRepository.findByIdAndUserId(positionId, currentUser.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pozisyon bulunamadi"));

        if (request.getSalePrice() == null || request.getSalePrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Satis fiyati gecersiz");
        }

        if ("SOLD".equalsIgnoreCase(position.getPositionStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu pozisyon zaten satildi");
        }

        position.setSalePrice(request.getSalePrice());
        position.setSoldAt(LocalDateTime.now());
        position.setPositionStatus("SOLD");
        position.setUpdatedAt(LocalDateTime.now());

        IpoPosition savedPosition = ipoPositionRepository.save(position);
        return toRow(savedPosition, savedPosition.getOffering().getCurrentPrice(), savedPosition.getOffering().getCurrency());
    }

    @Transactional
    public void deletePosition(Long positionId) {
        User currentUser = getCurrentUser();
        IpoPosition position = ipoPositionRepository.findByIdAndUserId(positionId, currentUser.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pozisyon bulunamadi"));

        ipoPositionRepository.delete(position);
    }

    private IpoSummaryItemDto toSummaryItem(IpoOffering offering) {
        List<IpoPortfolioRowDto> rows = ipoPositionRepository.findByOfferingIdAndUserIdOrderByAccountAccountNameAsc(offering.getId(), offering.getUser().getId()).stream()
            .map(position -> toRow(position, offering.getCurrentPrice(), offering.getCurrency()))
            .toList();

        IpoPortfolioSummaryDto summary = toSummary(rows, offering.getCurrency());

        return IpoSummaryItemDto.builder()
            .id(offering.getId())
            .code(offering.getCode())
            .companyName(offering.getCompanyName())
            .offeringPrice(offering.getOfferingPrice())
            .currentPrice(offering.getCurrentPrice())
            .totalLot(summary.getTotalLot())
            .totalCost(summary.getTotalCost())
            .totalCurrentValue(summary.getTotalCurrentValue())
            .totalProfitLoss(summary.getTotalProfitLoss())
            .positionCount(rows.size())
            .currency(offering.getCurrency())
            .build();
    }

    private IpoPortfolioRowDto toRow(IpoPosition position, BigDecimal currentPrice, String currency) {
        boolean sold = "SOLD".equalsIgnoreCase(position.getPositionStatus());
        BigDecimal effectivePrice = sold && position.getSalePrice() != null ? position.getSalePrice() : currentPrice;
        BigDecimal totalCost = position.getBuyPrice().multiply(BigDecimal.valueOf(position.getLotCount()));
        BigDecimal currentValue = effectivePrice.multiply(BigDecimal.valueOf(position.getLotCount()));

        return IpoPortfolioRowDto.builder()
            .positionId(position.getId())
            .accountId(position.getAccount().getId())
            .accountName(position.getAccount().getAccountName())
            .accountType(position.getAccount().getAccountType())
            .positionStatus(position.getPositionStatus())
            .sold(sold)
            .lotCount(position.getLotCount())
            .buyPrice(position.getBuyPrice())
            .salePrice(position.getSalePrice())
            .currentPrice(currentPrice)
            .totalCost(totalCost)
            .currentValue(currentValue)
            .profitLoss(currentValue.subtract(totalCost))
            .soldAt(position.getSoldAt())
            .currency(currency)
            .build();
    }

    private IpoPortfolioSummaryDto toSummary(List<IpoPortfolioRowDto> rows, String currency) {
        int totalLot = rows.stream().mapToInt(IpoPortfolioRowDto::getLotCount).sum();
        BigDecimal totalCost = rows.stream().map(IpoPortfolioRowDto::getTotalCost).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCurrentValue = rows.stream().map(IpoPortfolioRowDto::getCurrentValue).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfitLoss = rows.stream().map(IpoPortfolioRowDto::getProfitLoss).reduce(BigDecimal.ZERO, BigDecimal::add);

        return IpoPortfolioSummaryDto.builder()
            .totalLot(totalLot)
            .totalCost(totalCost)
            .totalCurrentValue(totalCurrentValue)
            .totalProfitLoss(totalProfitLoss)
            .currency(currency)
            .build();
    }

    private IpoHeaderDto toHeader(IpoOffering offering) {
        return IpoHeaderDto.builder()
            .id(offering.getId())
            .code(offering.getCode())
            .companyName(offering.getCompanyName())
            .offeringPrice(offering.getOfferingPrice())
            .currentPrice(offering.getCurrentPrice())
            .currency(offering.getCurrency())
            .status(offering.getStatus())
            .build();
    }

    private IpoPosition buildPosition(
        IpoPosition existingPosition,
        IpoOffering offering,
        Account account,
        User user,
        Integer lotCount,
        BigDecimal buyPrice,
        LocalDateTime buyDate,
        String notes
    ) {
        if (lotCount == null || lotCount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lot adedi pozitif olmali");
        }

        BigDecimal resolvedBuyPrice = buyPrice == null ? offering.getOfferingPrice() : buyPrice;
        if (resolvedBuyPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alis fiyati gecersiz");
        }

        LocalDateTime now = LocalDateTime.now();
        IpoPosition position = existingPosition == null ? new IpoPosition() : existingPosition;
        position.setUser(user);
        position.setOffering(offering);
        position.setAccount(account);
        position.setLotCount(lotCount);
        position.setBuyPrice(resolvedBuyPrice);
        position.setBuyDate(buyDate);
        position.setNotes(sanitize(notes));
        position.setPositionStatus(position.getPositionStatus() == null ? "ACTIVE" : position.getPositionStatus());
        position.setUpdatedAt(now);

        if (position.getCreatedAt() == null) {
            position.setCreatedAt(now);
        }

        return position;
    }

    private IpoOffering getOwnedOffering(Long ipoId, Long userId) {
        return ipoOfferingRepository.findByIdAndUserId(ipoId, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Halka arz bulunamadi"));
    }

    private Account getOwnedAccount(Long accountId, Long userId) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hesap secimi zorunludur");
        }

        return accountRepository.findByIdAndUserId(accountId, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hesap bulunamadi"));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Oturum gerekli");
        }

        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Kullanici bulunamadi"));
    }

    private String normalizeCode(String code) {
        String sanitizedCode = sanitize(code);
        return sanitizedCode == null ? null : sanitizedCode.toUpperCase(Locale.ROOT);
    }

    private String normalizeCurrency(String currency) {
        String sanitizedCurrency = sanitize(currency);
        return sanitizedCurrency == null ? "TRY" : sanitizedCurrency.toUpperCase(Locale.ROOT);
    }

    private String sanitize(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }
}