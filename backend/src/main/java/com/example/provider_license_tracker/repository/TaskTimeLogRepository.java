package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.TaskTimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskTimeLogRepository extends JpaRepository<TaskTimeLog, Long> {

}