package com.example.evaluation_project.model;

import com.example.evaluation_project.dto.ConfigurationDto;
import com.example.evaluation_project.dto.WorkspaceDto;
import com.example.evaluation_project.model.Configuration;
import com.example.evaluation_project.model.Workspace;

public class WorkspaceMapper {
    public static WorkspaceDto toDto(Workspace workspace) {
        if (workspace == null) return null;

        Configuration config = workspace.getConfiguration();
        ConfigurationDto configDto = null;
        if (config != null) {
            configDto = new ConfigurationDto(config.getId(), config.getName());
        }

        return new WorkspaceDto(
                workspace.getId(),
                workspace.getName(),
                workspace.getCreatedAt(),
                configDto
        );
    }
}
