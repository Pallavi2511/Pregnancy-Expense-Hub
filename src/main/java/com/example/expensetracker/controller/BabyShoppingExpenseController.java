package com.example.expensetracker.controller;

import com.example.expensetracker.model.BabyShoppingExpense;
import com.example.expensetracker.service.BabyShoppingExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/baby-shopping")
public class BabyShoppingExpenseController {

    private final BabyShoppingExpenseService service;

    public BabyShoppingExpenseController(BabyShoppingExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BabyShoppingExpense>> getAllExpenses() {
        return ResponseEntity.ok(service.getAllExpenses());
    }

    @PostMapping
    public ResponseEntity<BabyShoppingExpense> addExpense(@RequestBody BabyShoppingExpense expense) {
        return ResponseEntity.ok(service.addExpense(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BabyShoppingExpense> updateExpense(@PathVariable Long id,
                                                             @RequestBody BabyShoppingExpense expense) {
        return ResponseEntity.ok(service.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        service.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(service.getSummary());
    }
}
