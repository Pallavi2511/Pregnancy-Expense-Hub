package com.example.expensetracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String description;
    private Double amount;
    private LocalDate date;

    @Column(length = 128)
    private String category;
    @Column(name = "bill_path", length = 255)
    private String billFilePath;

    @Column(name = "pregnancy_month")
    private Integer pregnancyMonth;

    public String getBillPath() {
        return billFilePath;
    }

    public void setBillPath(String billPath) {
        this.billFilePath = billPath;
    }
}
