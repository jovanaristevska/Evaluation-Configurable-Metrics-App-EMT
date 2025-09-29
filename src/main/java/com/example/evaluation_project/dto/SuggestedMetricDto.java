package com.example.evaluation_project.dto;

public record SuggestedMetricDto(
        String metric,
        int min,
        int max,
        String description
) {}