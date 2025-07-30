package com.finance.tracker.dto;

import com.finance.tracker.model.TransactionType;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateTransactionDto(
    @NotBlank String title,
    @Positive Double amount,
    @PastOrPresent LocalDate date,
    TransactionType type,
    String category
) {}