package com.example.evaluation_project.repository;

import com.example.evaluation_project.model.ConfigurationMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConfigurationMetricRepository extends JpaRepository<ConfigurationMetric, Long> {
    List<ConfigurationMetric> findByConfigurationIdOrderByPosition(Long configurationId);
}