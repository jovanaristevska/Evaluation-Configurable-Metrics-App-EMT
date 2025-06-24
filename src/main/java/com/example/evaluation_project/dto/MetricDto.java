package com.example.evaluation_project.dto;

public record MetricDto(Long id, String name, double minValue, double maxValue, int position, String description, String scale) {}
