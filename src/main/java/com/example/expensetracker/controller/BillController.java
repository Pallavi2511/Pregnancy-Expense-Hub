package com.example.expensetracker.controller;

import com.example.expensetracker.service.ExpenseService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final ExpenseService expenseService;

    public BillController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadBill(@RequestParam("file") MultipartFile file) throws IOException {
        String filename = expenseService.saveExpenseBill(file);
        return ResponseEntity.ok(filename);
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getBill(@PathVariable String filename) {
        try {
            filename = Paths.get(filename).getFileName().toString();
            Path uploads = Paths.get("C:/Pallavi/pregnancy-app-data").toAbsolutePath().normalize();
            Path filePath = uploads.resolve(filename).normalize();
            if (Files.notExists(filePath) || !Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource bill = expenseService.loadExpenseBill(filename);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + bill.getFilename() + "\"")
                    .body(bill);
        } catch (IOException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
