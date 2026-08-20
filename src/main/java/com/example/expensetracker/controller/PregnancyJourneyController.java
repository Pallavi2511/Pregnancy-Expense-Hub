package com.example.expensetracker.controller;

import com.example.expensetracker.model.PregnancyJourneyNote;
import com.example.expensetracker.service.PregnancyJourneyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journey")
public class PregnancyJourneyController {

    private final PregnancyJourneyService service;

    public PregnancyJourneyController(PregnancyJourneyService service) {
        this.service = service;
    }

    @GetMapping("/{month}")
    public ResponseEntity<Map<String, Object>> getJourneyData(@PathVariable int month) {
        return ResponseEntity.ok(service.getJourneyData(month));
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress() {
        return ResponseEntity.ok(service.getProgress());
    }

    @GetMapping("/timeline")
    public ResponseEntity<List<Map<String, Object>>> getTimeline() {
        return ResponseEntity.ok(service.getTimeline());
    }

    @GetMapping("/checklist")
    public ResponseEntity<List<Map<String, Object>>> getChecklist() {
        return ResponseEntity.ok(service.getChecklist());
    }

    @GetMapping("/baby-growth")
    public ResponseEntity<List<Map<String, Object>>> getBabyGrowth() {
        return ResponseEntity.ok(service.getBabyGrowth());
    }

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights() {
        return ResponseEntity.ok(service.getInsights());
    }

    @PostMapping("/{month}/note")
    public ResponseEntity<PregnancyJourneyNote> addNote(@PathVariable int month,
                                                       @RequestBody Map<String, String> request) {
        String note = request.getOrDefault("note", "");
        String milestone = request.getOrDefault("milestone", "");
        return ResponseEntity.ok(service.saveNote(month, note, milestone));
    }

    @PutMapping("/{month}/note")
    public ResponseEntity<PregnancyJourneyNote> updateNote(@PathVariable int month,
                                                         @RequestBody Map<String, String> request) {
        String note = request.getOrDefault("note", "");
        String milestone = request.getOrDefault("milestone", "");
        return ResponseEntity.ok(service.updateNote(month, note, milestone));
    }
}
