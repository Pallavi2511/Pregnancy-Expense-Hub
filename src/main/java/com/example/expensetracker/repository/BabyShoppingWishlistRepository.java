package com.example.expensetracker.repository;

import com.example.expensetracker.model.BabyShoppingWishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BabyShoppingWishlistRepository extends JpaRepository<BabyShoppingWishlistItem, Long> {
}
