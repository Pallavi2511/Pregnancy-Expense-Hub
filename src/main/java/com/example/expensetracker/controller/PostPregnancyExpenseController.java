package com.example.expensetracker.controller;

import com.example.expensetracker.model.PostPregnancyExpense;
import com.example.expensetracker.service.PostPregnancyExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/post-pregnancy")
public class PostPregnancyExpenseController {

    private final PostPregnancyExpenseService service;

    public PostPregnancyExpenseController(PostPregnancyExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PostPregnancyExpense>> getAllExpenses() {
        return ResponseEntity.ok(service.getAllExpenses());
    }

    @PostMapping
    public ResponseEntity<PostPregnancyExpense> addExpense(@RequestBody PostPregnancyExpense expense) {
        return ResponseEntity.ok(service.addExpense(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostPregnancyExpense> updateExpense(@PathVariable Long id,
                                                             @RequestBody PostPregnancyExpense expense) {
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
