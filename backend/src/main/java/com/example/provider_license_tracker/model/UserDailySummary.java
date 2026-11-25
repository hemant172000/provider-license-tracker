package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_daily_summary")
public class UserDailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "total_active_minutes")
    private Integer totalActiveMinutes = 0;

    @Column(name = "total_idle_minutes")
    private Integer totalIdleMinutes = 0;

    @Column(name = "total_away_minutes")
    private Integer totalAwayMinutes = 0;

    @Column(name = "total_break_minutes")
    private Integer totalBreakMinutes = 0;

    @Column(name = "expected_hours")
    private Integer expectedHours = 8;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getActivityDate() { return activityDate; }
    public void setActivityDate(LocalDate activityDate) { this.activityDate = activityDate; }

    public Integer getTotalActiveMinutes() { return totalActiveMinutes; }
    public void setTotalActiveMinutes(Integer totalActiveMinutes) { this.totalActiveMinutes = totalActiveMinutes; }

    public Integer getTotalIdleMinutes() { return totalIdleMinutes; }
    public void setTotalIdleMinutes(Integer totalIdleMinutes) { this.totalIdleMinutes = totalIdleMinutes; }

    public Integer getTotalAwayMinutes() { return totalAwayMinutes; }
    public void setTotalAwayMinutes(Integer totalAwayMinutes) { this.totalAwayMinutes = totalAwayMinutes; }

    public Integer getTotalBreakMinutes() { return totalBreakMinutes; }
    public void setTotalBreakMinutes(Integer totalBreakMinutes) { this.totalBreakMinutes = totalBreakMinutes; }

    public Integer getExpectedHours() { return expectedHours; }
    public void setExpectedHours(Integer expectedHours) { this.expectedHours = expectedHours; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}