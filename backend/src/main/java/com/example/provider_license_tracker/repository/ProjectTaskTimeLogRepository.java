package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProjectTaskTimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectTaskTimeLogRepository extends JpaRepository<ProjectTaskTimeLog, Long> {

    List<ProjectTaskTimeLog> findByTaskIdOrderByLoggedAtAsc(Long taskId);

    void deleteByTaskId(Long taskId);

    @Query("SELECT t FROM ProjectTaskTimeLog t WHERE t.taskId = :taskId")
    List<ProjectTaskTimeLog> findTimeLogsByTaskId(@Param("taskId") Long taskId);

    @Query("SELECT COALESCE(SUM(t.hoursSpent), 0) FROM ProjectTaskTimeLog t WHERE t.taskId = :taskId")
    Integer getTotalHoursSpent(@Param("taskId") Long taskId);
}