package com.example.expensetracker;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.service.ExpenseService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ExpenseServiceMigrationTest {

    @Test
    void shouldMigrateOldUploadPathsToNewDirectory() {
        ExpenseRepository repository = Mockito.mock(ExpenseRepository.class);
        ExpenseService service = new ExpenseService(repository);

        Expense expense = new Expense();
        expense.setId(1L);
        expense.setBillFilePath("uploads/receipt.jpg");

        when(repository.findAll()).thenReturn(List.of(expense));

        service.migrateOldBillPaths();

        verify(repository).save(org.mockito.ArgumentMatchers.argThat(saved ->
                "receipt.jpg".equals(saved.getBillFilePath())
        ));
    }
}
