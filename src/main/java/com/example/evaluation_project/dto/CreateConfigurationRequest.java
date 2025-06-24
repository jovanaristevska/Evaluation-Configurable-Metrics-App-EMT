package com.example.evaluation_project.dto;

import java.util.List;

public record CreateConfigurationRequest(
        String workspaceName,
        String configurationName,
        List<MetricWithScale> metrics
) {
    public record MetricWithScale(Long metricId, int position, String scale) {}
}