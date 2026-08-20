package com.example.expensetracker.repository;

import com.example.expensetracker.model.BabyShoppingExpense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BabyShoppingExpenseRepository extends JpaRepository<BabyShoppingExpense, Long> {
}
