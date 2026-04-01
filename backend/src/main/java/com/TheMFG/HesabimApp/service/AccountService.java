package com.TheMFG.HesabimApp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.TheMFG.HesabimApp.dto.AccountCreateRequest;
import com.TheMFG.HesabimApp.dto.AccountResponseDto;
import com.TheMFG.HesabimApp.entity.Account;
import com.TheMFG.HesabimApp.entity.User;
import com.TheMFG.HesabimApp.repository.AccountRepository;
import com.TheMFG.HesabimApp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<AccountResponseDto> getAccounts() {
        User currentUser = getCurrentUser();

        return accountRepository.findByUserIdOrderByAccountNameAsc(currentUser.getId()).stream()
            .map(this::toDto)
            .toList();
    }

    public AccountResponseDto createAccount(AccountCreateRequest request) {
        User currentUser = getCurrentUser();
        String accountName = sanitize(request.getAccountName());

        if (accountName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hesap adi zorunludur");
        }

        Account account = Account.builder()
            .accountName(accountName)
            .accountType(sanitize(request.getAccountType()))
            .currency(normalizeCurrency(request.getCurrency()))
            .createdAt(LocalDateTime.now())
            .user(currentUser)
            .build();

        return toDto(accountRepository.save(account));
    }

    private AccountResponseDto toDto(Account account) {
        return AccountResponseDto.builder()
            .id(account.getId())
            .accountName(account.getAccountName())
            .accountType(account.getAccountType())
            .currency(account.getCurrency())
            .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Oturum gerekli");
        }

        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Kullanici bulunamadi"));
    }

    private String sanitize(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }

    private String normalizeCurrency(String currency) {
        String sanitizedCurrency = sanitize(currency);
        return sanitizedCurrency == null ? "TRY" : sanitizedCurrency.toUpperCase(Locale.ROOT);
    }
}