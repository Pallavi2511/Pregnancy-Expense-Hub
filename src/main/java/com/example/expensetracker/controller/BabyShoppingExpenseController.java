package com.example.expensetracker.controller;

import com.example.expensetracker.model.BabyShoppingExpense;
import com.example.expensetracker.model.BabyShoppingWishlistItem;
import com.example.expensetracker.service.BabyShoppingExpenseService;
import com.example.expensetracker.service.ExpenseService;
import com.example.expensetracker.service.BabyShoppingWishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/baby-shopping")
public class BabyShoppingExpenseController {

    private final BabyShoppingExpenseService service;
    private final ExpenseService expenseService;
    private final BabyShoppingWishlistService wishlistService;

    public BabyShoppingExpenseController(BabyShoppingExpenseService service, ExpenseService expenseService,
            BabyShoppingWishlistService wishlistService) {
        this.service = service;
        this.expenseService = expenseService;
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<BabyShoppingExpense>> getAllExpenses() {
        return ResponseEntity.ok(service.getAllExpenses());
    }

    @PostMapping
    public ResponseEntity<BabyShoppingExpense> addExpense(@RequestBody BabyShoppingExpense expense) {
        return ResponseEntity.ok(service.addExpense(expense));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<BabyShoppingExpense> addExpenseWithBill(
            @RequestPart("expense") BabyShoppingExpense expense,
            @RequestPart(value = "file", required = false) MultipartFile file) throws java.io.IOException {
        if (file != null && !file.isEmpty()) {
            expense.setBill(expenseService.saveExpenseBill(file));
        }
        return ResponseEntity.ok(service.addExpense(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BabyShoppingExpense> updateExpense(@PathVariable Long id,
            @RequestBody BabyShoppingExpense expense) {
        return ResponseEntity.ok(service.updateExpense(id, expense));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<BabyShoppingExpense> updateExpenseWithBill(
            @PathVariable Long id,
            @RequestPart("expense") BabyShoppingExpense expense,
            @RequestPart(value = "file", required = false) MultipartFile file) throws java.io.IOException {
        if (file != null && !file.isEmpty()) {
            expense.setBill(expenseService.saveExpenseBill(file));
        }
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

    @GetMapping("/wishlist")
    public ResponseEntity<List<BabyShoppingWishlistItem>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getAllItems());
    }

    @PostMapping("/wishlist")
    public ResponseEntity<BabyShoppingWishlistItem> addWishlistItem(@RequestBody BabyShoppingWishlistItem item) {
        return ResponseEntity.ok(wishlistService.addItem(item));
    }

    @DeleteMapping("/wishlist/{id}")
    public ResponseEntity<Void> deleteWishlistItem(@PathVariable Long id) {
        wishlistService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/wishlist/{id}/purchase")
    public ResponseEntity<BabyShoppingExpense> markWishlistItemAsPurchased(@PathVariable Long id) {
        return ResponseEntity.ok(wishlistService.markAsPurchased(id));
    }
}
