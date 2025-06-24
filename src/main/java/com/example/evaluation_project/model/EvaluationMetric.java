package com.example.evaluation_project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evaluation_metrics", schema = "public", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"evaluation_id", "metric_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class EvaluationMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "evaluation_id")
    private Evaluation evaluation;

    @ManyToOne
    @JoinColumn(name = "metric_id")
    private Metric metric;

    private Double value;
}
