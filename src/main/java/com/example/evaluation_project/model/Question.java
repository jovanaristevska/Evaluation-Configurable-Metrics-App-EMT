package com.example.evaluation_project.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "questions", schema = "public")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_key")
    private Long questionKey;

    @Column(columnDefinition = "text")
    private String text;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "version_id")
    private Version version;
}

