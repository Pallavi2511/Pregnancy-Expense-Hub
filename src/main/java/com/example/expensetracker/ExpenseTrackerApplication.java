package com.example.expensetracker;

import com.example.expensetracker.service.ExpenseService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseTrackerApplication.class, args);
    }

    @Bean
    public CommandLineRunner migrateBills(ExpenseService expenseService) {
        return args -> {
            try {
                expenseService.migrateOldBillPaths();
            } catch (Exception ex) {
                System.err.println("Bill path migration skipped: " + ex.getMessage());
            }
        };
    }
}
