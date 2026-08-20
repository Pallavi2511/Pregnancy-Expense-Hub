package com.example.expensetracker;

import com.example.expensetracker.controller.PostPregnancyExpenseController;
import com.example.expensetracker.model.PostPregnancyExpense;
import com.example.expensetracker.service.PostPregnancyExpenseService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class PostPregnancyExpenseControllerTest {

    @Test
    void shouldReturnCreatedExpenseFromService() {
        PostPregnancyExpenseService service = Mockito.mock(PostPregnancyExpenseService.class);
        PostPregnancyExpenseController controller = new PostPregnancyExpenseController(service);

        PostPregnancyExpense expense = new PostPregnancyExpense();
        expense.setId(1L);
        expense.setDescription("Pediatric visit");
        expense.setAmount(1200.0);
        expense.setDate(LocalDate.of(2024, 5, 4));
        expense.setCategory("Pediatric Visits");

        when(service.addExpense(any(PostPregnancyExpense.class))).thenReturn(expense);

        ResponseEntity<PostPregnancyExpense> response = controller.addExpense(expense);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Pediatric visit", response.getBody().getDescription());
    }

    @Test
    void shouldReturnSummaryFromService() {
        PostPregnancyExpenseService service = Mockito.mock(PostPregnancyExpenseService.class);
        PostPregnancyExpenseController controller = new PostPregnancyExpenseController(service);

        Map<String, Object> summary = Map.of(
                "total", 5000.0,
                "highestMonth", Map.of("month", 4, "amount", 3000.0),
                "average", 2500.0
        );

        when(service.getSummary()).thenReturn(summary);

        ResponseEntity<Map<String, Object>> response = controller.getSummary();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5000.0, response.getBody().get("total"));
        assertEquals(4, ((Map<String, Object>) response.getBody().get("highestMonth")).get("month"));
        assertEquals(3000.0, ((Map<String, Object>) response.getBody().get("highestMonth")).get("amount"));
    }
}
