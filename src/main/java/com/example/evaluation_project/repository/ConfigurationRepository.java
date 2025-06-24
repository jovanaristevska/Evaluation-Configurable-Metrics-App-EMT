package com.example.evaluation_project.repository;

import com.example.evaluation_project.model.Configuration;
import com.example.evaluation_project.model.ConfigurationMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConfigurationRepository extends JpaRepository<Configuration, Long> {

}