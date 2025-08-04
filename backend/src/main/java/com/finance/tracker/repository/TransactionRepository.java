package com.finance.tracker.repository;

import com.finance.tracker.model.Transaction;
import com.finance.tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME'")
    Double getTotalIncomeByUser(User user);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE'")
    Double getTotalExpenseByUser(User user);

    List<Transaction> findAllByUserOrderByDateDesc(User user);

    boolean existsByIdAndUser(Long id, User user);

    Optional<Transaction> findByIdAndUser(Long id, User user);

    List<Transaction> findAllByUser(User user);
}