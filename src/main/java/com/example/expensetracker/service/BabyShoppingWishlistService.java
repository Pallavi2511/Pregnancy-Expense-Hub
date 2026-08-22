package com.example.expensetracker.service;

import com.example.expensetracker.model.BabyShoppingExpense;
import com.example.expensetracker.model.BabyShoppingWishlistItem;
import com.example.expensetracker.repository.BabyShoppingWishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BabyShoppingWishlistService {

    private final BabyShoppingWishlistRepository wishlistRepository;
    private final BabyShoppingExpenseService expenseService;

    public BabyShoppingWishlistService(BabyShoppingWishlistRepository wishlistRepository,
            BabyShoppingExpenseService expenseService) {
        this.wishlistRepository = wishlistRepository;
        this.expenseService = expenseService;
    }

    public List<BabyShoppingWishlistItem> getAllItems() {
        return wishlistRepository.findAll();
    }

    public BabyShoppingWishlistItem addItem(BabyShoppingWishlistItem item) {
        return wishlistRepository.save(item);
    }

    public void deleteItem(Long id) {
        wishlistRepository.deleteById(id);
    }

    @Transactional
    public BabyShoppingExpense markAsPurchased(Long id) {
        BabyShoppingWishlistItem item = wishlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist item not found: " + id));

        BabyShoppingExpense expense = new BabyShoppingExpense();
        expense.setDescription(item.getName());
        expense.setItemName(item.getName());
        expense.setQuantity(1);
        expense.setAmount(item.getEstimatedCost());
        expense.setDate(LocalDate.now());
        expense.setCategory("Essentials");

        BabyShoppingExpense savedExpense = expenseService.addExpense(expense);
        wishlistRepository.delete(item);
        return savedExpense;
    }
}
