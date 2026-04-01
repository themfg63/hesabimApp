package com.TheMFG.HesabimApp.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ipo_positions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpoPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer lotCount;

    private BigDecimal buyPrice;

    private BigDecimal salePrice;

    private LocalDateTime buyDate;

    private LocalDateTime soldAt;

    private String positionStatus;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "ipo_id")
    private IpoOffering offering;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}