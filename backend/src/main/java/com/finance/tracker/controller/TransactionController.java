package com.finance.tracker.controller;

import com.finance.tracker.dto.CreateTransactionDto;
import com.finance.tracker.model.Transaction;
import com.finance.tracker.service.TransactionService;
import com.finance.tracker.dto.TransactionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
        @Valid @RequestBody CreateTransactionDto dto
    ) {
        Transaction created = transactionService.createTransaction(dto);
        return ResponseEntity
            .created(URI.create("/api/transactions/" + created.getId()))
            .body(created);
    }

    @GetMapping("/summary")
    public Map<String, Double> getSummary() {
        return transactionService.getSummary();
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(transactionService.getAllTransactions(type, category, startDate, endDate));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTransactions(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<TransactionResponse> filteredTransactions = transactionService.getAllTransactions(type, category, startDate, endDate);
        byte[] csvBytes = transactionService.exportTransactionsToCsv(filteredTransactions);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "transactions.csv");
        headers.setContentLength(csvBytes.length);

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
        @PathVariable Long id,
        @Valid @RequestBody CreateTransactionDto dto
    ) {
        Transaction updated = transactionService.updateTransaction(id, dto);
        return ResponseEntity.ok(transactionService.convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}