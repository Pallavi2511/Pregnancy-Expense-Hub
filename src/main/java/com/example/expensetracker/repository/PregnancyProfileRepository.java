package com.example.expensetracker.repository;

import com.example.expensetracker.model.PregnancyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PregnancyProfileRepository extends JpaRepository<PregnancyProfile, Long> {

    Optional<PregnancyProfile> findFirstByOrderByIdAsc();
}
