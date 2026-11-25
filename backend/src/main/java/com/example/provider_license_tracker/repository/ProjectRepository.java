// ProjectRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.Project;
import com.example.provider_license_tracker.model.ProjectAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {


    @Query("SELECT p FROM Project p WHERE p.groupId IN :groupIds OR p.providerId IN :providerIds")
    List<Project> findByGroupIdsOrProviderIds(@Param("groupIds") List<Long> groupIds, @Param("providerIds") List<Long> providerIds);

    List<Project> findByStatus(String status);


    List<Project> findByCreatedBy(Long userId);
}
