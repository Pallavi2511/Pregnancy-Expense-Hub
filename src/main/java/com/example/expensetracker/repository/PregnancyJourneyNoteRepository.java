package com.example.expensetracker.repository;

import com.example.expensetracker.model.PregnancyJourneyNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PregnancyJourneyNoteRepository extends JpaRepository<PregnancyJourneyNote, Long> {
    Optional<PregnancyJourneyNote> findByMonth(Integer month);
}
