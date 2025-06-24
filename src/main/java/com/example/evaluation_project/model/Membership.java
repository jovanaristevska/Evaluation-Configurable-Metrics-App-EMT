package com.example.evaluation_project.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "memberships", schema = "public",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "workspace_id"}))
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private HefUser user;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "next_question_id")
    private Question nextQuestion;

    @ManyToOne
    @JoinColumn(name = "current_question_id")
    private Question currentQuestion;
}
