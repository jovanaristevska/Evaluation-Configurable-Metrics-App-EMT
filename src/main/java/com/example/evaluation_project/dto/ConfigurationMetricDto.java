package com.example.evaluation_project.dto;

public record ConfigurationMetricDto(
        Long id,
        Long configurationId,
        Long metricId,
        String metricName,
        Double metricMinValue,
        Double metricMaxValue,
        String metricDescription,
        Integer position,
        String scale
) {}
