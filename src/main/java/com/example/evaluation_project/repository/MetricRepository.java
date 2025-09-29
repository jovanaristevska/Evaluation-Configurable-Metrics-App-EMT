package com.example.evaluation_project.repository;

import com.example.evaluation_project.model.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {
    @Query("SELECT m FROM Metric m " +
            "WHERE (:domain IS NULL OR m.domain = :domain) " +
            "AND (:type IS NULL OR m.type = :type) " +
            "AND (:description IS NULL OR LOWER(m.description) LIKE LOWER(CONCAT('%', :description, '%')))")
    List<Metric> findByFilters(@Param("domain") String domain,
                               @Param("type") String type,
                               @Param("description") String description);
}

