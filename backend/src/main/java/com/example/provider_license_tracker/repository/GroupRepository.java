// GroupRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    // Legacy: still works for primary manager
    Optional<Group> findByManagerUserId(Long managerUserId);

    // New: find group where user is in the managerUserIds list
    @Query("SELECT g FROM Group g JOIN g.managerUserIds mid WHERE mid = :userId")
    Optional<Group> findByManagerUserIdsContaining(@Param("userId") Long userId);
}