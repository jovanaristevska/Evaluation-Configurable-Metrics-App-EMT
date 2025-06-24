package com.example.evaluation_project.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "models", schema = "public",
        uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "name"}))
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;
}
