package com.example.expensetracker.controller;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Value("${file.upload-dir:C:/Pallavi/pregnancy-app-data}")
    private String uploadDir;

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<Expense> addExpense(@RequestPart(value = "expense", required = false) Expense expense,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String storedFilename = expenseService.saveExpenseBill(file);
            if (expense == null) {
                expense = new Expense();
            }
            expense.setBillFilePath(storedFilename);
        }

        Expense savedExpense = expenseService.saveExpense(expense == null ? new Expense() : expense);
        return ResponseEntity.ok(savedExpense);
    }

    @PostMapping("/uploadBill")
    public ResponseEntity<Expense> uploadBill(@RequestPart("expense") Expense expense,
            @RequestPart("file") MultipartFile file) throws IOException {
        String filename = expenseService.saveExpenseBill(file);
        expense.setBillFilePath(filename);
        Expense savedExpense = expenseService.saveExpense(expense);
        return ResponseEntity.ok(savedExpense);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> listExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getTotalExpenses(@RequestParam Long userId) {
        return ResponseEntity.ok(expenseService.getTotalExpenses(userId));
    }

    @GetMapping("/month/{month}")
    public ResponseEntity<List<Expense>> getExpensesByMonth(@PathVariable int month) {
        return ResponseEntity.ok(expenseService.getExpensesByMonth(month));
    }

    @GetMapping("/bill/{id}")
    public ResponseEntity<Resource> getBill(@PathVariable Long id) throws IOException {
        Optional<Expense> expenseOptional = expenseService.getExpenseById(id);
        if (expenseOptional.isEmpty() || expenseOptional.get().getBillFilePath() == null || expenseOptional.get().getBillFilePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String filename = expenseOptional.get().getBillFilePath();
        Resource resource = expenseService.loadExpenseBill(filename);
        String contentType = Files.probeContentType(Paths.get(uploadDir).resolve(filename));
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/by-month/{month}")
    public ResponseEntity<List<Expense>> getExpensesByPregnancyMonth(@PathVariable int month) {
        return ResponseEntity.ok(expenseService.getExpensesByMonth(month));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id,
            @RequestBody Expense expense) {
        Optional<Expense> existingExpense = expenseService.getExpenseById(id);
        if (existingExpense.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Expense current = existingExpense.get();
        current.setDescription(expense.getDescription());
        current.setAmount(expense.getAmount());
        current.setDate(expense.getDate());
        current.setCategory(expense.getCategory());
        current.setBillFilePath(expense.getBillFilePath());
        current.setPregnancyMonth(expense.getPregnancyMonth());

        Expense savedExpense = expenseService.saveExpense(current);
        return ResponseEntity.ok(savedExpense);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Expense> updateExpenseWithFile(@PathVariable Long id,
            @RequestPart("expense") Expense expense,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        Optional<Expense> existingExpense = expenseService.getExpenseById(id);
        if (existingExpense.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Expense current = existingExpense.get();
        current.setDescription(expense.getDescription());
        current.setAmount(expense.getAmount());
        current.setDate(expense.getDate());
        current.setCategory(expense.getCategory());
        current.setPregnancyMonth(expense.getPregnancyMonth());

        if (file != null && !file.isEmpty()) {
            String filename = expenseService.saveExpenseBill(file);
            current.setBillFilePath(filename);
        } else {
            current.setBillFilePath(expense.getBillFilePath());
        }

        Expense savedExpense = expenseService.saveExpense(current);
        return ResponseEntity.ok(savedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        if (!expenseService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        expenseService.deleteExpenseById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary/total")
    public ResponseEntity<Map<String, Object>> getSummaryTotal() {
        return ResponseEntity.ok(Map.of("total", expenseService.getTotalExpenses()));
    }

    @GetMapping("/summary/monthly")
    public ResponseEntity<Map<Integer, Double>> getMonthlySummary() {
        return ResponseEntity.ok(expenseService.getMonthlyTotals());
    }

    @GetMapping("/summary/highest-month")
    public ResponseEntity<Map<String, Object>> getHighestExpenseMonth() {
        Integer highestMonth = expenseService.getHighestExpenseMonth();
        Double highestTotal = highestMonth == null ? 0.0 : expenseService.getMonthlyTotals().get(highestMonth);
        return ResponseEntity.ok(Map.of(
                "month", highestMonth,
                "total", highestTotal
        ));
    }

    @GetMapping("/summary/average")
    public ResponseEntity<Map<String, Object>> getAverageMonthlyExpense() {
        return ResponseEntity.ok(Map.of("average", expenseService.getAverageMonthlyExpense()));
    }

    @GetMapping("/summary/bills-count")
    public ResponseEntity<Map<String, Object>> getBillsCount() {
        return ResponseEntity.ok(Map.of("billsCount", expenseService.getBillCount()));
    }

    @GetMapping("/summary/overview")
    public ResponseEntity<Map<String, Object>> getSummaryOverview() {
        double total = expenseService.getTotalExpenses();
        Integer highestMonth = expenseService.getHighestExpenseMonth();
        double highestAmount = 0.0;

        if (highestMonth != null) {
            highestAmount = expenseService.getMonthlyTotals().getOrDefault(highestMonth, 0.0);
        }

        return ResponseEntity.ok(Map.of(
                "total", total,
                "highestMonth", Map.of(
                        "month", highestMonth,
                        "amount", highestAmount
                ),
                "average", expenseService.getAverageMonthlyExpense()
        ));
    }

    @GetMapping("/month/{month}/total")
    public ResponseEntity<Double> getMonthlyTotal(@PathVariable int month,
            @RequestParam Long userId) {
        return ResponseEntity.ok(expenseService.getTotalExpensesByMonth(userId, month));
    }

    @GetMapping("/bills/export-zip")
    public ResponseEntity<Resource> exportBillsAsZip() throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // De-dupe in case multiple expenses reference the same bill file
        Set<String> billFilenames = new LinkedHashSet<>();
        for (Expense expense : expenseService.getAllExpenses()) {
            String billFilePath = expense.getBillFilePath();
            if (billFilePath != null && !billFilePath.isBlank()) {
                billFilenames.add(billFilePath);
            }
        }

        Path tempZip = Files.createTempFile("bills-export-", ".zip");
        tempZip.toFile().deleteOnExit();
        try (ZipOutputStream zipOut = new ZipOutputStream(Files.newOutputStream(tempZip))) {
            for (String filename : billFilenames) {
                Path billPath = uploadPath.resolve(filename).normalize();
                if (!billPath.startsWith(uploadPath) || Files.notExists(billPath) || !Files.isReadable(billPath)) {
                    continue;
                }
                zipOut.putNextEntry(new ZipEntry(filename));
                Files.copy(billPath, zipOut);
                zipOut.closeEntry();
            }
        }

        Resource zipResource = new org.springframework.core.io.UrlResource(tempZip.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bills-export.zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipResource);
    }
}
