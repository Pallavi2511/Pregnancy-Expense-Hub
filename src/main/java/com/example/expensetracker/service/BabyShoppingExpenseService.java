package com.example.expensetracker.service;

import com.example.expensetracker.model.BabyShoppingExpense;
import com.example.expensetracker.repository.BabyShoppingExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BabyShoppingExpenseService {

    private final BabyShoppingExpenseRepository repository;

    public BabyShoppingExpenseService(BabyShoppingExpenseRepository repository) {
        this.repository = repository;
    }

    public List<BabyShoppingExpense> getAllExpenses() {
        return repository.findAll();
    }

    public BabyShoppingExpense addExpense(BabyShoppingExpense expense) {
        return repository.save(expense);
    }

    public BabyShoppingExpense updateExpense(Long id, BabyShoppingExpense expense) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setDescription(expense.getDescription());
                    existing.setAmount(expense.getAmount());
                    existing.setDate(expense.getDate());
                    existing.setCategory(expense.getCategory());
                    existing.setBill(expense.getBill());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Baby shopping expense not found: " + id));
    }

    public void deleteExpense(Long id) {
        repository.deleteById(id);
    }

    public Map<String, Object> getSummary() {
        List<BabyShoppingExpense> expenses = repository.findAll();

        double total = expenses.stream()
                .map(BabyShoppingExpense::getAmount)
                .filter(amount -> amount != null)
                .mapToDouble(Double::doubleValue)
                .sum();

        Map<Integer, Double> monthlyTotals = expenses.stream()
                .filter(expense -> expense.getDate() != null)
                .collect(Collectors.groupingBy(expense -> expense.getDate().getMonthValue(),
                        Collectors.summingDouble(expense -> expense.getAmount() == null ? 0.0 : expense.getAmount())));

        double average = monthlyTotals.isEmpty() ? 0.0 : monthlyTotals.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        int highestMonth = monthlyTotals.entrySet().stream()
                .max(Comparator.comparingDouble(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(0);

        double highestAmount = monthlyTotals.getOrDefault(highestMonth, 0.0);

        return Map.of(
                "total", total,
                "highestMonth", Map.of("month", highestMonth, "amount", highestAmount),
                "average", average
        );
    }
}
