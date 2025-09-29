package com.example.evaluation_project.service;

import com.example.evaluation_project.model.Metric;
import com.example.evaluation_project.repository.MetricRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MetricService {

    private final MetricRepository metricRepository;

    public MetricService(MetricRepository metricRepository) {
        this.metricRepository = metricRepository;
    }

    public List<Metric> suggestMetrics(String description, String type, String domain) {
        return metricRepository.findByFilters(domain, type, description);
    }
}
