package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    List<UserActivity> findByUserIdAndActivityDateOrderByStartTimeAsc(Long userId, LocalDate date);

    Optional<UserActivity> findTopByUserIdAndActivityDateOrderByStartTimeDesc(Long userId, LocalDate date);

    @Query("SELECT u FROM UserActivity u WHERE u.userId = :userId AND u.endTime IS NULL")
    Optional<UserActivity> findOpenSessionByUserId(@Param("userId") Long userId);

    @Query("SELECT u FROM UserActivity u WHERE u.userId = :userId AND u.startTime >= :startTime")
    List<UserActivity> findActivitiesSince(@Param("userId") Long userId, @Param("startTime") LocalDateTime startTime);
}