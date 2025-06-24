package com.example.evaluation_project.dto;

import java.time.LocalDateTime;

public record WorkspaceDto(
        Long id,
        String name,
        LocalDateTime createdAt,
        ConfigurationDto configuration
) {}