package com.example.expensetracker.service;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Value("${file.upload-dir:C:/Pallavi/pregnancy-app-data}")
    private String uploadDir = "C:/Pallavi/pregnancy-app-data";

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public java.util.Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    public String saveExpenseBill(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalFilename = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String filename = System.currentTimeMillis() + "_" + originalFilename;
        Path targetPath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    public void migrateOldBillPaths() {
        List<Expense> expenses = expenseRepository.findAll();
        for (Expense expense : expenses) {
            String billPath = expense.getBillPath();
            if (billPath != null) {
                String filename = Paths.get(billPath).getFileName().toString();
                if (!filename.isBlank()) {
                    expense.setBillPath(filename);
                    expenseRepository.save(expense);
                }
            }
        }
    }

    public Resource loadExpenseBill(String filename) throws IOException {
        Path targetPath = Paths.get(uploadDir).resolve(filename).toAbsolutePath().normalize();
        if (!targetPath.startsWith(Paths.get(uploadDir).toAbsolutePath().normalize()) || Files.notExists(targetPath) || !Files.isReadable(targetPath)) {
            throw new IOException("Bill file not found: " + filename);
        }
        return new UrlResource(targetPath.toUri());
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Double getTotalExpenses(Long userId) {
        return getExpensesForUser(userId)
                .stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    public Double getTotalExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    public Map<Integer, Double> getMonthlyTotals() {
        Map<Integer, Double> monthlyTotals = IntStream.rangeClosed(1, 9)
                .boxed()
                .collect(Collectors.toMap(month -> month, month -> 0.0, (a, b) -> a, LinkedHashMap::new));

        expenseRepository.findAll()
                .stream()
                .filter(expense -> expense.getPregnancyMonth() != null)
                .forEach(expense -> {
                    int month = expense.getPregnancyMonth();
                    monthlyTotals.put(month,
                            monthlyTotals.getOrDefault(month, 0.0) + (expense.getAmount() == null ? 0.0 : expense.getAmount()));
                });

        return monthlyTotals;
    }

    public Integer getHighestExpenseMonth() {
        return getMonthlyTotals().entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    public Double getAverageMonthlyExpense() {
        Double total = getTotalExpenses();
        return total / 9.0;
    }

    public Long getBillCount() {
        return expenseRepository.findAll()
                .stream()
                .filter(expense -> expense.getBillFilePath() != null && !expense.getBillFilePath().isBlank())
                .count();
    }

    public Double getTotalExpensesByMonth(Long userId, int pregnancyMonth) {
        return getExpensesForUser(userId)
                .stream()
                .filter(expense -> expense.getPregnancyMonth() != null && expense.getPregnancyMonth() == pregnancyMonth)
                .map(Expense::getAmount)
                .filter(amount -> amount != null)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private List<Expense> getExpensesForUser(Long userId) {
        if (userId == null) {
            return expenseRepository.findAll();
        }
        return expenseRepository.findByUserId(userId);
    }

    public List<Expense> getExpensesByMonth(int pregnancyMonth) {
        return expenseRepository.findAll()
                .stream()
                .filter(expense -> expense.getPregnancyMonth() != null && expense.getPregnancyMonth() == pregnancyMonth)
                .toList();
    }

    public void deleteExpenseById(Long id) {
        expenseRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return expenseRepository.existsById(id);
    }
}
