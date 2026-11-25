package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {

    List<ProjectTask> findByProjectId(Long projectId);
    Optional<ProjectTask> findById(Long id);

    List<ProjectTask> findByAssignedTo(Long userId);
}