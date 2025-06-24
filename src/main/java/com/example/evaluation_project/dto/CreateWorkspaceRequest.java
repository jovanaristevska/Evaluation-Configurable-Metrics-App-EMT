package com.example.evaluation_project.dto;


public record CreateWorkspaceRequest(
        String name,
        Long configurationId
) {}