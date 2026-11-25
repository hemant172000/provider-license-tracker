package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.UserDailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserDailySummaryRepository extends JpaRepository<UserDailySummary, Long> {

    Optional<UserDailySummary> findByUserIdAndActivityDate(Long userId, LocalDate date);

    List<UserDailySummary> findByActivityDate(LocalDate date);

    @Query("SELECT u FROM UserDailySummary u WHERE u.activityDate BETWEEN :startDate AND :endDate")
    List<UserDailySummary> findBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT u FROM UserDailySummary u WHERE u.userId IN :userIds AND u.activityDate = :date")
    List<UserDailySummary> findByUserIdsAndDate(@Param("userIds") List<Long> userIds, @Param("date") LocalDate date);
}