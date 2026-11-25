package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProjectTaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectTaskCommentRepository extends JpaRepository<ProjectTaskComment, Long> {

    List<ProjectTaskComment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    void deleteByTaskId(Long taskId);

    @Query("SELECT c FROM ProjectTaskComment c WHERE c.taskId = :taskId ORDER BY c.createdAt ASC")
    List<ProjectTaskComment> findCommentsByTaskId(@Param("taskId") Long taskId);
}