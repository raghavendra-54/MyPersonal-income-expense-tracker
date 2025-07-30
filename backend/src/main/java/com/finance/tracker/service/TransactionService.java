package com.finance.tracker.service;

import com.finance.tracker.model.Transaction;
import com.finance.tracker.repository.TransactionRepository;
import com.finance.tracker.repository.UserRepository; // Keep this import for now, will remove if not needed
import com.finance.tracker.model.User; // Keep this import for now
import com.finance.tracker.model.TransactionType;
import lombok.RequiredArgsConstructor;
import com.finance.tracker.dto.CreateTransactionDto;
import com.finance.tracker.dto.TransactionResponse;

import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct; // Keep this import for now
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository; // Keep this for now

    // REMOVED @PostConstruct init() for default user creation here
    // We will create users via registration/login instead

    public Map<String, Double> getSummary() {
        Double income = transactionRepository.getTotalIncome() != null ? 
                       transactionRepository.getTotalIncome() : 0.0;
        Double expense = transactionRepository.getTotalExpense() != null ? 
                        transactionRepository.getTotalExpense() : 0.0;

        return Map.of(
            "totalIncome", income,
            "totalExpense", expense,
            "balance", income - expense
        );
    }

    public Transaction createTransaction(CreateTransactionDto dto) {
        Transaction transaction = new Transaction();
        transaction.setTitle(dto.title());
        transaction.setAmount(dto.amount());
        transaction.setDate(dto.date() != null ? dto.date() : LocalDate.now());
        transaction.setType(dto.type());
        transaction.setCategory(dto.category());

        // TEMPORARY: Assign a user to the transaction (assuming user with ID 1 exists from previous runs or manual creation)
        // In a real authenticated app, this would be the currently logged-in user.
        Optional<User> userOptional = userRepository.findById(1L); 
        if (userOptional.isPresent()) {
            transaction.setUser(userOptional.get());
        } else {
            // Fallback: If no user with ID 1, try to find any user.
            // If no user exists at all (e.g., fresh H2), this will throw an error until a user is registered.
            userOptional = userRepository.findAll().stream().findFirst();
            if (userOptional.isPresent()) {
                transaction.setUser(userOptional.get());
            } else {
                System.err.println("WARNING: No user found to associate with transaction. Please register a user.");
                // For now, allow saving without user if no user exists, but this is not ideal for real app.
                // Or throw new RuntimeException("No user found to associate with transaction.");
            }
        }

        return transactionRepository.save(transaction);
    }

    public List<TransactionResponse> getAllTransactions(
        String type, String category, LocalDate startDate, LocalDate endDate
    ) {
        List<Transaction> transactions = transactionRepository.findAll();

        List<Transaction> filteredTransactions = transactions.stream()
            .filter(t -> {
                boolean matches = true;
                if (t.getDate() == null) {
                    return false;
                }

                if (type != null && !type.isEmpty()) {
                    matches = matches && t.getType().name().equalsIgnoreCase(type);
                }
                if (category != null && !category.isEmpty()) {
                    matches = matches && t.getCategory() != null && t.getCategory().equalsIgnoreCase(category);
                }
                if (startDate != null) {
                    matches = matches && (t.getDate().isEqual(startDate) || t.getDate().isAfter(startDate));
                }
                if (endDate != null) {
                    matches = matches && (t.getDate().isEqual(endDate) || t.getDate().isBefore(endDate));
                }
                return matches;
            })
            .sorted(Comparator.comparing(Transaction::getDate).reversed())
            .collect(Collectors.toList());

        return filteredTransactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Transaction updateTransaction(Long id, CreateTransactionDto dto) {
        try {
            Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + id));

            existingTransaction.setTitle(dto.title());
            existingTransaction.setAmount(dto.amount());
            existingTransaction.setDate(dto.date() != null ? dto.date() : LocalDate.now());
            existingTransaction.setType(dto.type());
            existingTransaction.setCategory(dto.category());

            return transactionRepository.save(existingTransaction);
        } catch (Exception e) {
            System.err.println("Error updating transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update transaction: " + e.getMessage(), e);
        }
    }

    public void deleteTransaction(Long id) {
        try {
            if (!transactionRepository.existsById(id)) {
                throw new RuntimeException("Transaction not found with ID: " + id);
            }
            transactionRepository.deleteById(id);
        } catch (Exception e) {
            System.err.println("Error deleting transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete transaction: " + e.getMessage(), e);
        }
    }

    public TransactionResponse convertToDto(Transaction transaction) {
        return new TransactionResponse(
            transaction.getId(),
            transaction.getTitle(),
            transaction.getAmount(),
            transaction.getDate(),
            transaction.getType(),
            transaction.getCategory()
        );
    }

    public byte[] exportTransactionsToCsv(List<TransactionResponse> transactions) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(bos)) {

            writer.println("ID,Date,Type,Category,Title,Amount");

            for (TransactionResponse t : transactions) {
                writer.printf("%d,%s,%s,%s,\"%s\",%.2f%n",
                    t.getId(),
                    t.getDate().toString(),
                    t.getType().name(),
                    t.getCategory(),
                    t.getTitle().replace("\"", "\"\""),
                    t.getAmount()
                );
            }
            writer.flush();
            return bos.toByteArray();

        } catch (Exception e) {
            System.err.println("Error generating CSV: " + e.getMessage());
            throw new RuntimeException("Failed to generate CSV export", e);
        }
    }
}