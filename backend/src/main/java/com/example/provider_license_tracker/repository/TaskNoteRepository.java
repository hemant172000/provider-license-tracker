package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.TaskNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskNoteRepository extends JpaRepository<TaskNote, Long> {
    List<TaskNote> findByTaskIdOrderByCreatedAtAsc(Long taskId);
}