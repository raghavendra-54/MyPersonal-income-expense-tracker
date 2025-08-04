package com.finance.tracker.dto;

import com.finance.tracker.model.TransactionType;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionDto {
    @NotBlank(message = "Title is required")
    private String title;
    @Positive(message = "Amount must be positive")
    @NotNull(message = "Amount is required")
    private Double amount;
    @PastOrPresent(message = "Date cannot be in the future")
    @NotNull(message = "Date is required")
    private LocalDate date;
    @NotNull(message = "Transaction type is required")
    private TransactionType type;
    private String category;
}