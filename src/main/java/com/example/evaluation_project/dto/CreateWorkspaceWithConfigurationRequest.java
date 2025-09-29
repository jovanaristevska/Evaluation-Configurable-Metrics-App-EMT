package com.example.evaluation_project.dto;

import java.util.List;

public record CreateWorkspaceWithConfigurationRequest(
        String workspaceName,
        String configurationName,
        List<MetricWithScale> metrics,
        List<QuestionAnswerDto> entries
) {
    public record MetricWithScale(Long metricId, int position, String scale) {}
}