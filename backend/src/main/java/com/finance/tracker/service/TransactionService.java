package com.finance.tracker.service;

import com.finance.tracker.model.Transaction;
import com.finance.tracker.repository.TransactionRepository;
import com.finance.tracker.repository.UserRepository;
import com.finance.tracker.model.User;
import com.finance.tracker.model.TransactionType;
import lombok.RequiredArgsConstructor;
import com.finance.tracker.dto.CreateTransactionDto;
import com.finance.tracker.dto.TransactionResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException; 

import org.springframework.stereotype.Service;
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
    private final UserRepository userRepository; 

    // Helper method to get the current authenticated user
    private User getCurrentAuthenticatedUser() {
        System.out.println("TransactionService: Attempting to get current authenticated user."); 
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("TransactionService: User not authenticated. Throwing exception."); 
            throw new RuntimeException("User not authenticated.");
        }
        String userEmail = authentication.getName(); 
        System.out.println("TransactionService: Authenticated user email from SecurityContext: " + userEmail); 

        if ("anonymousUser".equals(userEmail) || userEmail == null || userEmail.isEmpty()) {
            System.out.println("TransactionService: Anonymous user detected or email is empty. Falling back to default@example.com."); 
            return userRepository.findByEmail("default@example.com")
                                 .orElseThrow(() -> new UsernameNotFoundException("Default user not found, and no authenticated user."));
        }
        
        User foundUser = userRepository.findByEmail(userEmail)
                             .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));
        System.out.println("TransactionService: Found user: " + foundUser.getEmail() + " (ID: " + foundUser.getId() + ")"); 
        return foundUser;
    }

    public Map<String, Double> getSummary() {
        System.out.println("TransactionService: getSummary method called."); 
        User currentUser = getCurrentAuthenticatedUser(); 
        System.out.println("TransactionService: getSummary for user: " + currentUser.getEmail()); 
        
        Double income = transactionRepository.getTotalIncomeByUser(currentUser) != null ?
                       transactionRepository.getTotalIncomeByUser(currentUser) : 0.0;
        Double expense = transactionRepository.getTotalExpenseByUser(currentUser) != null ?
                        transactionRepository.getTotalExpenseByUser(currentUser) : 0.0;

        System.out.println("TransactionService: Income: " + income + ", Expense: " + expense); 
        return Map.of(
            "totalIncome", income,
            "totalExpense", expense,
            "balance", income - expense
        );
    }

    public Transaction createTransaction(CreateTransactionDto dto) {
        System.out.println("TransactionService: createTransaction method called."); 
        User currentUser = getCurrentAuthenticatedUser(); 
        Transaction transaction = new Transaction();
        transaction.setTitle(dto.getTitle());
        transaction.setAmount(dto.getAmount());
        transaction.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        transaction.setType(dto.getType());
        transaction.setCategory(dto.getCategory());
        transaction.setUser(currentUser); 

        return transactionRepository.save(transaction);
    }

    public List<TransactionResponse> getAllTransactions(
        String type, String category, LocalDate startDate, LocalDate endDate
    ) {
        System.out.println("TransactionService: getAllTransactions method called with filters."); 
        User currentUser = getCurrentAuthenticatedUser(); 
        List<Transaction> transactions = transactionRepository.findAllByUserOrderByDateDesc(currentUser); 

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

        System.out.println("TransactionService: Found " + filteredTransactions.size() + " filtered transactions."); 
        return filteredTransactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Transaction updateTransaction(Long id, CreateTransactionDto dto) {
        System.out.println("TransactionService: updateTransaction method called for ID: " + id); 
        User currentUser = getCurrentAuthenticatedUser(); 
        try {
            Transaction existingTransaction = transactionRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new RuntimeException("Transaction not found or not owned by current user with ID: " + id));

            existingTransaction.setTitle(dto.getTitle());
            existingTransaction.setAmount(dto.getAmount());
            existingTransaction.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
            existingTransaction.setType(dto.getType());
            existingTransaction.setCategory(dto.getCategory());

            return transactionRepository.save(existingTransaction);
        } catch (Exception e) {
            System.err.println("Error updating transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update transaction: " + e.getMessage(), e);
        }
    }

    public void deleteTransaction(Long id) {
        System.out.println("TransactionService: deleteTransaction method called for ID: " + id); 
        User currentUser = getCurrentAuthenticatedUser(); 
        try {
            if (!transactionRepository.existsByIdAndUser(id, currentUser)) {
                throw new RuntimeException("Transaction not found or not owned by current user with ID: " + id);
            }
            transactionRepository.deleteById(id);
        } catch (Exception e) {
            System.err.println("Error deleting transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete transaction: " + e.getMessage(), e);
        }
    }

    public TransactionResponse convertToDto(Transaction transaction) {
        System.out.println("TransactionService: convertToDto called for transaction ID: " + transaction.getId()); 
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
        System.out.println("TransactionService: exportTransactionsToCsv method called."); 
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(bos)) {

            writer.println("ID,Date,Type,Category,Title,Amount");

            for (TransactionResponse t : transactions) {
                writer.printf("%d,%s,%s,%s,\"%s\",%.2f%n",
                    t.getId(),
                    t.getDate().toString(),
                    t.getType().name(),
                    t.getCategory() != null ? t.getCategory() : "", 
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