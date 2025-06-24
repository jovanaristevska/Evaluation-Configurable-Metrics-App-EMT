package com.example.evaluation_project.web.controller;

import com.example.evaluation_project.dto.CreateWorkspaceRequest;
import com.example.evaluation_project.dto.CreateWorkspaceWithConfigurationRequest;
import com.example.evaluation_project.dto.WorkspaceDto;
import com.example.evaluation_project.model.*;
import com.example.evaluation_project.repository.ConfigurationRepository;
import com.example.evaluation_project.repository.MetricRepository;
import com.example.evaluation_project.repository.WorkspaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceRepository workspaceRepository;
    private final ConfigurationRepository configurationRepository;
    private final MetricRepository metricRepository;

    public WorkspaceController(WorkspaceRepository workspaceRepository, ConfigurationRepository configurationRepository, MetricRepository metricRepository) {
        this.workspaceRepository = workspaceRepository;
        this.configurationRepository = configurationRepository;
        this.metricRepository = metricRepository;
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@RequestBody CreateWorkspaceRequest request) {
        if (workspaceRepository.existsByName(request.name())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Workspace with the name '" + request.name() + "' already exists.");
        }

        Configuration configuration = configurationRepository.findById(request.configurationId())
                .orElse(null);

        if (configuration == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Workspace workspace = new Workspace();
        workspace.setName(request.name());
        workspace.setCreatedAt(LocalDateTime.now());
        workspace.setConfiguration(configuration);

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceDto dto = WorkspaceMapper.toDto(savedWorkspace);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    @PostMapping("/with-new-configuration")
    public ResponseEntity<?> createWithNewConfig(@RequestBody CreateWorkspaceWithConfigurationRequest req) {
        if (workspaceRepository.existsByName(req.workspaceName())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Workspace with the name '" + req.workspaceName() + "' already exists.");
        }

        Configuration config = new Configuration();
        config.setName(req.configurationName());

        List<ConfigurationMetric> configMetrics = req.metrics().stream().map(metricDto -> {
            Metric metric = metricRepository.findById(metricDto.metricId()).orElseThrow();
            ConfigurationMetric cm = new ConfigurationMetric();
            cm.setMetric(metric);
            cm.setConfiguration(config);
            cm.setPosition(metricDto.position());
            cm.setScale(metricDto.scale());
            return cm;
        }).toList();

        config.setConfigurationMetrics(configMetrics);
        configurationRepository.save(config);

        Workspace workspace = new Workspace();
        workspace.setName(req.workspaceName());
        workspace.setCreatedAt(LocalDateTime.now());
        workspace.setConfiguration(config);

        Workspace saved = workspaceRepository.save(workspace);
        WorkspaceDto dto = WorkspaceMapper.toDto(saved);
        return ResponseEntity.ok(dto);
    }
}
