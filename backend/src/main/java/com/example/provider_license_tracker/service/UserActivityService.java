package com.example.provider_license_tracker.service;

import com.example.provider_license_tracker.model.UserActivity;
import com.example.provider_license_tracker.model.UserDailySummary;
import com.example.provider_license_tracker.repository.UserActivityRepository;
import com.example.provider_license_tracker.repository.UserDailySummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserActivityService {

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Autowired
    private UserDailySummaryRepository userDailySummaryRepository;

    @Value("${activity.idle.threshold:60}")
    private int idleThreshold;

    @Value("${activity.away.threshold:900}")
    private int awayThreshold;

    @Value("${activity.break.threshold:1800}")
    private int breakThreshold;

    // Generate or get session ID for the user
    public String getOrCreateSessionId(Long userId) {
        // You can store session in Redis or just generate new for each day
        return userId + "_" + LocalDate.now() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    // Record user activity status
    @Transactional
    public void recordActivity(Long userId, String status, String sessionId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // Check for open session (unclosed activity)
        UserActivity openSession = userActivityRepository.findOpenSessionByUserId(userId).orElse(null);

        if (openSession != null && !openSession.getStatus().equals(status)) {
            // Close the previous session
            long durationSeconds = ChronoUnit.SECONDS.between(openSession.getStartTime(), now);
            openSession.setEndTime(now);
            openSession.setDurationMinutes((int) (durationSeconds / 60));
            userActivityRepository.save(openSession);
        }

        // Create new activity record only if status changed or no open session
        if (openSession == null || !openSession.getStatus().equals(status)) {
            UserActivity activity = new UserActivity();
            activity.setUserId(userId);
            activity.setActivityDate(today);
            activity.setStatus(status);
            activity.setStartTime(now);
            activity.setSessionId(sessionId);
            activity.setCreatedAt(now);
            userActivityRepository.save(activity);
        }

        // Update daily summary
        updateDailySummary(userId, today);
    }

    // Update daily summary for a user
    @Transactional
    public void updateDailySummary(Long userId, LocalDate date) {
        List<UserActivity> activities = userActivityRepository.findByUserIdAndActivityDateOrderByStartTimeAsc(userId, date);

        int totalActive = 0;
        int totalIdle = 0;
        int totalAway = 0;
        int totalBreak = 0;

        for (UserActivity activity : activities) {
            int duration = activity.getDurationMinutes() != null ? activity.getDurationMinutes() : 0;
            switch (activity.getStatus().toUpperCase()) {
                case "ACTIVE":
                    totalActive += duration;
                    break;
                case "IDLE":
                    totalIdle += duration;
                    break;
                case "AWAY":
                    totalAway += duration;
                    break;
                case "BREAK":
                    totalBreak += duration;
                    break;
            }
        }

        UserDailySummary summary = userDailySummaryRepository
                .findByUserIdAndActivityDate(userId, date)
                .orElse(new UserDailySummary());

        summary.setUserId(userId);
        summary.setActivityDate(date);
        summary.setTotalActiveMinutes(totalActive);
        summary.setTotalIdleMinutes(totalIdle);
        summary.setTotalAwayMinutes(totalAway);
        summary.setTotalBreakMinutes(totalBreak);
        summary.setExpectedHours(8);
        summary.setLastUpdated(LocalDateTime.now());

        userDailySummaryRepository.save(summary);
    }

    // Get user activity for a specific date
    public List<UserActivity> getUserActivity(Long userId, LocalDate date) {
        return userActivityRepository.findByUserIdAndActivityDateOrderByStartTimeAsc(userId, date);
    }

    // Get daily summary for a user
    public UserDailySummary getUserDailySummary(Long userId, LocalDate date) {
        return userDailySummaryRepository
                .findByUserIdAndActivityDate(userId, date)
                .orElse(null);
    }

    // Get all users' activity summary for a date (Admin view)
    public List<UserDailySummary> getAllUsersSummary(LocalDate date) {
        return userDailySummaryRepository.findByActivityDate(date);
    }

    // Get users' activity summary for a date range
    public List<UserDailySummary> getUsersSummaryRange(LocalDate startDate, LocalDate endDate) {
        return userDailySummaryRepository.findBetweenDates(startDate, endDate);
    }

    // Get team members' activity summary (for Team Leader)
    public List<UserDailySummary> getTeamMembersSummary(List<Long> teamMemberIds, LocalDate date) {
        return userDailySummaryRepository.findByUserIdsAndDate(teamMemberIds, date);
    }

    // Calculate remaining hours needed
    public int getRemainingMinutes(Long userId, LocalDate date) {
        UserDailySummary summary = getUserDailySummary(userId, date);
        if (summary == null) {
            return 8 * 60; // 8 hours in minutes
        }
        int expectedMinutes = summary.getExpectedHours() * 60;
        int workedMinutes = summary.getTotalActiveMinutes();
        return Math.max(0, expectedMinutes - workedMinutes);
    }

    // Get activity timeline for display
    public Map<String, Object> getActivityTimeline(Long userId, LocalDate date) {
        List<UserActivity> activities = getUserActivity(userId, date);
        UserDailySummary summary = getUserDailySummary(userId, date);

        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("activities", activities);
        result.put("summary", summary);
        result.put("remainingMinutes", getRemainingMinutes(userId, date));

        return result;
    }
}