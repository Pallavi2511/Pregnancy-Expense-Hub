package com.example.expensetracker.service;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.model.PregnancyJourneyNote;
import com.example.expensetracker.model.PregnancyProfile;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.PregnancyJourneyNoteRepository;
import com.example.expensetracker.repository.PregnancyProfileRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PregnancyJourneyService {

    private final ExpenseRepository expenseRepository;
    private final PregnancyJourneyNoteRepository journeyNoteRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;

    public PregnancyJourneyService(ExpenseRepository expenseRepository,
            PregnancyJourneyNoteRepository journeyNoteRepository,
            PregnancyProfileRepository pregnancyProfileRepository) {
        this.expenseRepository = expenseRepository;
        this.journeyNoteRepository = journeyNoteRepository;
        this.pregnancyProfileRepository = pregnancyProfileRepository;
    }

    public Map<String, Object> getPregnancyWeek() {
        return pregnancyProfileRepository.findFirstByOrderByIdAsc()
                .map(this::buildPregnancyWeek)
                .orElseGet(Map::of);
    }

    public Map<String, Object> savePregnancyDates(LocalDate dueDate, LocalDate lastMenstrualPeriod) {
        if (dueDate == null && lastMenstrualPeriod == null) {
            throw new IllegalArgumentException("Enter a due date or last menstrual period.");
        }

        LocalDate calculatedDueDate = dueDate != null ? dueDate : lastMenstrualPeriod.plusDays(280);
        PregnancyProfile profile = pregnancyProfileRepository.findFirstByOrderByIdAsc()
                .orElseGet(PregnancyProfile::new);
        profile.setDueDate(calculatedDueDate);
        return buildPregnancyWeek(pregnancyProfileRepository.save(profile));
    }

    public Map<String, Object> getThisWeekDevelopment() {
        return pregnancyProfileRepository.findFirstByOrderByIdAsc()
                .map(profile -> buildThisWeekDevelopment(buildPregnancyWeek(profile)))
                .orElseGet(Map::of);
    }

    private Map<String, Object> buildThisWeekDevelopment(Map<String, Object> pregnancyWeek) {
        int currentWeek = (int) pregnancyWeek.get("currentWeek");
        Map<String, Object> growth = getNearestGrowthReference(currentWeek);
        Map<String, Object> development = new LinkedHashMap<>();
        development.put("week", currentWeek);
        development.put("size", growth.get("size"));
        development.put("length", growth.get("length"));
        development.put("weight", growth.get("weight"));

        if (currentWeek <= 13) {
            development.put("summary", "Major organs and body systems are forming, while early growth continues quickly.");
            development.put("bodyChanges", List.of("Tiredness, nausea, breast tenderness, or more frequent urination can be common.", "Energy and appetite can vary from day to day."));
            development.put("comfortSuggestions", List.of("Rest when you can and keep fluids nearby.", "Choose small, regular meals if that feels more comfortable."));
        } else if (currentWeek <= 27) {
            development.put("summary", "Growth continues steadily, with developing movement, senses, and sleep-wake patterns.");
            development.put("bodyChanges", List.of("A growing abdomen, back discomfort, and changes in sleep can be common.", "Some people begin to notice regular movement during this stage."));
            development.put("comfortSuggestions", List.of("Use supportive seating and change positions regularly.", "Gentle movement and regular hydration can help with everyday comfort."));
        } else {
            development.put("summary", "Your baby continues to gain weight and prepare body systems for life after birth.");
            development.put("bodyChanges", List.of("Shortness of breath with activity, heartburn, swelling, or interrupted sleep can be common.", "Movement patterns can feel different as space becomes tighter."));
            development.put("comfortSuggestions", List.of("Rest with your feet supported when practical.", "Keep follow-up appointments and discuss preparation questions with your care team."));
        }

        development.put("careNote", "Contact your healthcare provider promptly for symptoms that feel severe, sudden, or concerning to you, including bleeding, fluid leakage, severe pain, severe headache, vision changes, or a noticeable change in your baby's usual movement pattern.");
        return development;
    }

    private Map<String, Object> getNearestGrowthReference(int currentWeek) {
        return getBabyGrowth().stream()
                .min(java.util.Comparator.comparingInt(item -> Math.abs((int) item.get("week") - currentWeek)))
                .orElse(Map.of("size", "Growing baby", "weight", "Varies", "length", "Varies"));
    }

    private Map<String, Object> buildPregnancyWeek(PregnancyProfile profile) {
        LocalDate today = LocalDate.now();
        LocalDate gestationStart = profile.getDueDate().minusDays(280);
        long elapsedDays = ChronoUnit.DAYS.between(gestationStart, today);
        int currentWeek = Math.max(1, Math.min(40, (int) (elapsedDays / 7) + 1));
        int currentDay = Math.max(0, Math.min(6, (int) (elapsedDays % 7)));
        LocalDate weekStart = gestationStart.plusDays((long) (currentWeek - 1) * 7);
        LocalDate weekEnd = weekStart.plusDays(6);
        long daysRemaining = Math.max(0, ChronoUnit.DAYS.between(today, profile.getDueDate()));

        String trimester = currentWeek <= 13 ? "First Trimester" : currentWeek <= 27 ? "Second Trimester" : "Third Trimester";
        Map<String, Object> pregnancyWeek = new LinkedHashMap<>();
        pregnancyWeek.put("dueDate", profile.getDueDate());
        pregnancyWeek.put("currentWeek", currentWeek);
        pregnancyWeek.put("currentDay", currentDay);
        pregnancyWeek.put("trimester", trimester);
        pregnancyWeek.put("daysRemaining", daysRemaining);
        pregnancyWeek.put("weekStart", weekStart);
        pregnancyWeek.put("weekEnd", weekEnd);
        return pregnancyWeek;
    }

    public Map<String, Object> getJourneyData(int month) {
        List<Expense> expenses = expenseRepository.findAll()
                .stream()
                .filter(expense -> expense.getPregnancyMonth() != null && expense.getPregnancyMonth() == month)
                .toList();

        PregnancyJourneyNote note = journeyNoteRepository.findByMonth(month).orElseGet(() -> {
            PregnancyJourneyNote emptyNote = new PregnancyJourneyNote();
            emptyNote.setMonth(month);
            emptyNote.setMilestone(getDefaultMilestone(month));
            emptyNote.setNote("");
            return emptyNote;
        });

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("month", month);
        data.put("milestone", note.getMilestone());
        data.put("note", note.getNote());
        data.put("expenses", expenses);
        return data;
    }

    public PregnancyJourneyNote saveNote(int month, String note, String milestone) {
        Optional<PregnancyJourneyNote> existing = journeyNoteRepository.findByMonth(month);
        PregnancyJourneyNote journeyNote = existing.orElseGet(PregnancyJourneyNote::new);
        journeyNote.setMonth(month);
        journeyNote.setNote(note);
        journeyNote.setMilestone(milestone);
        return journeyNoteRepository.save(journeyNote);
    }

    public PregnancyJourneyNote updateNote(int month, String note, String milestone) {
        return saveNote(month, note, milestone);
    }

    public Map<String, Object> getProgress() {
        Map<String, Object> progress = new LinkedHashMap<>();
        progress.put("currentWeek", 19);
        progress.put("currentDay", 2);
        progress.put("babySize", "Bell pepper");
        progress.put("nextAppointment", "2026-07-16");
        progress.put("todayMedicine", "Prenatal vitamin + iron supplement");
        progress.put("waterIntake", 64);
        progress.put("waterGoal", 96);
        progress.put("currentWeight", 62.4);
        progress.put("totalExpenses", expenseRepository.findAll().stream().map(Expense::getAmount).filter(amount -> amount != null).mapToDouble(Double::doubleValue).sum());
        progress.put("thisMonthExpenses", expenseRepository.findAll().stream().filter(expense -> expense.getDate() != null && expense.getDate().getMonthValue() == java.time.LocalDate.now().getMonthValue()).map(Expense::getAmount).filter(amount -> amount != null).mapToDouble(Double::doubleValue).sum());
        return progress;
    }

    public List<Map<String, Object>> getTimeline() {
        return List.of(
                Map.of("week", 4, "title", "Early pregnancy", "notes", "Initial prenatal visit and initial screening"),
                Map.of("week", 8, "title", "First trimester check", "notes", "Hormonal shifts and early scans"),
                Map.of("week", 12, "title", "End of first trimester", "notes", "Nuchal translucency scan and routine follow-up"),
                Map.of("week", 20, "title", "Halfway point", "notes", "Anatomy scan and fetal movement check"),
                Map.of("week", 28, "title", "Third trimester begins", "notes", "Glucose screening and growth check"),
                Map.of("week", 36, "title", "Preparation month", "notes", "Hospital bag and birth plan discussion"),
                Map.of("week", 40, "title", "Expected delivery", "notes", "Final checks and delivery prep")
        );
    }

    public List<Map<String, Object>> getChecklist() {
        return List.of(
                Map.of("trimester", "First", "title", "Book the first prenatal visit", "done", true),
                Map.of("trimester", "First", "title", "Start prenatal vitamins", "done", true),
                Map.of("trimester", "Second", "title", "Prepare maternity clothes", "done", false),
                Map.of("trimester", "Second", "title", "Review birthing classes", "done", false),
                Map.of("trimester", "Third", "title", "Pack the hospital bag", "done", false),
                Map.of("trimester", "Third", "title", "Confirm hospital plans", "done", false)
        );
    }

    public List<Map<String, Object>> getBabyGrowth() {
        return List.of(
                Map.of("week", 16, "size", "Avocado", "weight", "3.5 oz", "length", "4.6 in"),
                Map.of("week", 20, "size", "Banana", "weight", "10.2 oz", "length", "6.5 in"),
                Map.of("week", 24, "size", "Corn", "weight", "1.3 lb", "length", "8.1 in"),
                Map.of("week", 28, "size", "Eggplant", "weight", "2.2 lb", "length", "10.5 in"),
                Map.of("week", 32, "size", "Squash", "weight", "3.7 lb", "length", "11.7 in"),
                Map.of("week", 36, "size", "Honeydew", "weight", "5.8 lb", "length", "18.6 in"),
                Map.of("week", 40, "size", "Watermelon", "weight", "7.5 lb", "length", "20.1 in")
        );
    }

    public Map<String, Object> getInsights() {
        Map<Integer, Double> byMonth = expenseRepository.findAll().stream()
                .filter(expense -> expense.getPregnancyMonth() != null)
                .collect(Collectors.groupingBy(Expense::getPregnancyMonth, Collectors.summingDouble(expense -> expense.getAmount() == null ? 0.0 : expense.getAmount())));

        Integer highestMonth = byMonth.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(1);
        Double highestAmount = byMonth.getOrDefault(highestMonth, 0.0);
        String highestCategory = expenseRepository.findAll().stream()
                .filter(expense -> expense.getCategory() != null && !expense.getCategory().isBlank())
                .collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(expense -> expense.getAmount() == null ? 0.0 : expense.getAmount())))
                .entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("General");

        Map<String, Object> insights = new LinkedHashMap<>();
        insights.put("highestExpenseCategory", highestCategory);
        insights.put("mostExpensiveMonth", highestMonth);
        insights.put("insuranceEligible", true);
        insights.put("pendingClaims", 2);
        insights.put("highestExpenseAmount", highestAmount);
        return insights;
    }

    private String getDefaultMilestone(int month) {
        return switch (month) {
            case 1 ->
                "First prenatal visit and initial wellness check";
            case 2 ->
                "Early fetal development and nutrition planning";
            case 3 ->
                "First trimester screening and routine care";
            case 4 ->
                "Second trimester begins with anatomy scan";
            case 5 ->
                "Movement felt and baby growth continues";
            case 6 ->
                "Mid-pregnancy check-in and maternity planning";
            case 7 ->
                "Third trimester preparations and birthing classes";
            case 8 ->
                "Final month checks and hospital packing";
            case 9 ->
                "Baby arrives soon and delivery plan finalized";
            default ->
                "Pregnancy milestone";
        };
    }
}
