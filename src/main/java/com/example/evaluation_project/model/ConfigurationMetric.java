package com.example.evaluation_project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "configuration_metrics", schema = "public", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"configuration_id", "metric_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ConfigurationMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "configuration_id")
    private Configuration configuration;

    @ManyToOne
    @JoinColumn(name = "metric_id")
    private Metric metric;

    private Integer position;

    @Column(name = "scale")
    private String scale;
}
