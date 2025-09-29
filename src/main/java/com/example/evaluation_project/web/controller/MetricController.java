package com.example.evaluation_project.web.controller;

import com.example.evaluation_project.dto.SuggestedMetricDto;
import com.example.evaluation_project.dto.WorkspaceDescriptionDto;
import com.example.evaluation_project.model.Metric;
import com.example.evaluation_project.repository.MetricRepository;
import com.example.evaluation_project.service.MetricService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricController {

    private final MetricRepository metricRepository;
    public final MetricService metricService;


    public MetricController(MetricRepository metricRepository, MetricService metricService) {
        this.metricRepository = metricRepository;
        this.metricService = metricService;
    }

    @GetMapping
    public List<Metric> getAllMetrics() {
        return metricRepository.findAll();
    }

    @PostMapping("/suggest")
    public ResponseEntity<List<SuggestedMetricDto>> suggestMetrics(@RequestBody WorkspaceDescriptionDto request) {
        List<Metric> suggestedMetrics = metricService.suggestMetrics(
                request.description(),
                request.type(),
                request.domain()
        );

        List<SuggestedMetricDto> dtos = suggestedMetrics.stream()
                .map(m -> new SuggestedMetricDto(
                        m.getName(),
                        m.getMinValue().intValue(),
                        m.getMaxValue().intValue(),
                        m.getDescription()
                ))
                .toList();

        return ResponseEntity.ok(dtos);
    }
}
