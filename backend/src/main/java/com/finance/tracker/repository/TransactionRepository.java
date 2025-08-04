package com.finance.tracker.repository;

import com.finance.tracker.model.Transaction;
import com.finance.tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Query to get total income for a specific user
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME'")
    Double getTotalIncomeByUser(User user);

    // Query to get total expense for a specific user
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE'")
    Double getTotalExpenseByUser(User user);

    // Find all transactions for a specific user, ordered by date descending
    List<Transaction> findAllByUserOrderByDateDesc(User user);

    // Check if a transaction exists by ID for a specific user
    boolean existsByIdAndUser(Long id, User user);

    // Find a transaction by ID for a specific user
    Optional<Transaction> findByIdAndUser(Long id, User user);

    // Find all transactions for a specific user
    List<Transaction> findAllByUser(User user);
}