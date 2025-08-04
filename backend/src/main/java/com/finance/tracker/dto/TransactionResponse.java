package com.finance.tracker.dto;

import com.finance.tracker.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String title;
    private Double amount;
    private LocalDate date;
    private TransactionType type;
    private String category;
}