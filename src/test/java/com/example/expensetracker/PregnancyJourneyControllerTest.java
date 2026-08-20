package com.example.expensetracker;

import com.example.expensetracker.controller.PregnancyJourneyController;
import com.example.expensetracker.model.PregnancyJourneyNote;
import com.example.expensetracker.service.PregnancyJourneyService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class PregnancyJourneyControllerTest {

    @Test
    void shouldReturnJourneySummaryForMonth() {
        PregnancyJourneyService service = Mockito.mock(PregnancyJourneyService.class);
        PregnancyJourneyController controller = new PregnancyJourneyController(service);

        when(service.getJourneyData(3)).thenReturn(Map.of(
                "month", 3,
                "milestone", "First trimester checkup",
                "note", "Feeling good",
                "expenses", java.util.List.of()
        ));

        ResponseEntity<Map<String, Object>> response = controller.getJourneyData(3);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("First trimester checkup", response.getBody().get("milestone"));
        assertEquals("Feeling good", response.getBody().get("note"));
    }

    @Test
    void shouldReturnProgressPayload() {
        PregnancyJourneyService service = Mockito.mock(PregnancyJourneyService.class);
        PregnancyJourneyController controller = new PregnancyJourneyController(service);

        when(service.getProgress()).thenReturn(Map.of(
                "currentWeek", 19,
                "currentDay", 2,
                "babySize", "Bell pepper",
                "nextAppointment", "2026-07-16"
        ));

        ResponseEntity<Map<String, Object>> response = controller.getProgress();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(19, response.getBody().get("currentWeek"));
        assertEquals("Bell pepper", response.getBody().get("babySize"));
    }
}
