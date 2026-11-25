package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProjectAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectAssigneeRepository extends JpaRepository<ProjectAssignee, Long> {

    List<ProjectAssignee> findByProjectId(Long projectId);

    List<ProjectAssignee> findByUserId(Long userId);

    void deleteByProjectId(Long projectId);
}