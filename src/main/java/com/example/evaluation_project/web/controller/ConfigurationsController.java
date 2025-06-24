package com.example.evaluation_project.web.controller;

import com.example.evaluation_project.dto.ConfigurationDto;
import com.example.evaluation_project.dto.CreateConfigurationRequest;
import com.example.evaluation_project.dto.MetricDto;
import com.example.evaluation_project.dto.WorkspaceDto;
import com.example.evaluation_project.model.*;
import com.example.evaluation_project.repository.ConfigurationMetricRepository;
import com.example.evaluation_project.repository.ConfigurationRepository;
import com.example.evaluation_project.repository.MetricRepository;
import com.example.evaluation_project.repository.WorkspaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/configurations")
public class ConfigurationsController {

    private final ConfigurationRepository configurationRepository;
    private final ConfigurationMetricRepository configurationMetricRepository;
    private final MetricRepository metricRepository;
    private final WorkspaceRepository workspaceRepository;

    public ConfigurationsController(ConfigurationRepository configurationRepo, ConfigurationMetricRepository configurationMetricRepo, MetricRepository metricRepository, WorkspaceRepository workspaceRepository) {
        this.configurationRepository = configurationRepo;
        this.configurationMetricRepository = configurationMetricRepo;
        this.metricRepository = metricRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @GetMapping
    public List<ConfigurationDto> getAllConfigurations() {
        List<Configuration> configurations = configurationRepository.findAll();
        System.out.println("Configurations found: " + configurations.size());
        return configurations.stream()
                .map(c -> new ConfigurationDto(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/metrics")
    public List<MetricDto> getMetricsForConfiguration(@PathVariable Long id) {
        return configurationMetricRepository.findByConfigurationIdOrderByPosition(id).stream()
                .map(cm -> {
                    Metric m = cm.getMetric();
                    return new MetricDto(m.getId(), m.getName(), m.getMinValue(), m.getMaxValue(), cm.getPosition(), m.getDescription(), cm.getScale());
                })
                .collect(Collectors.toList());
    }


    @PostMapping
    public ResponseEntity<?> createConfigurationAndWorkspace(@RequestBody CreateConfigurationRequest request) {
        if (workspaceRepository.existsByName(request.workspaceName())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Workspace with the name '" + request.workspaceName() + "' already exists.");
        }

        Configuration configuration = new Configuration();
        configuration.setName(request.configurationName());
        configuration = configurationRepository.save(configuration);

        Workspace workspace = new Workspace();
        workspace.setName(request.workspaceName());
        workspace.setCreatedAt(LocalDateTime.now());
        workspace.setConfiguration(configuration);
        workspace = workspaceRepository.save(workspace);

        for (CreateConfigurationRequest.MetricWithScale m : request.metrics()) {
            Metric metric = metricRepository.findById(m.metricId()).orElseThrow();
            ConfigurationMetric cm = new ConfigurationMetric();
            cm.setConfiguration(configuration);
            cm.setMetric(metric);
            cm.setPosition(m.position());
            cm.setScale(m.scale());
            configurationMetricRepository.save(cm);
        }

        return ResponseEntity.ok(WorkspaceMapper.toDto(workspace));
    }


}
