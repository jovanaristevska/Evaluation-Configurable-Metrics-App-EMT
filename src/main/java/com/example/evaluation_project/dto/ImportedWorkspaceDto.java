package com.example.evaluation_project.dto;

import java.util.List;

public record ImportedWorkspaceDto(Long workspaceId,
                                   String name,
                                   List<QuestionAnswerDto> entries) {
}
