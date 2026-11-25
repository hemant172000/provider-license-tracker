package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.Task;
import com.example.provider_license_tracker.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(AppUser user);
    List<Task> findAll();
    List<Task> findByAssignedToOrderByDueDateAsc(AppUser assignedTo);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByAssignedToAndStatus(AppUser assignedTo, TaskStatus status);

    List<Task> findByAssignedToIn(List<AppUser> teamMembers);



    List<Task> findByStatusAndAssignedTo(TaskStatus status, AppUser assignedTo);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND t.status = :status")
    List<Task> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);
}
