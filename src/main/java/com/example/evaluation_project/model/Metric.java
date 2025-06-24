package com.example.evaluation_project.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "metrics", schema = "public")
@Data
@NoArgsConstructor
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "min_value")
    private Double minValue;

    @Column(name = "max_value")
    private Double maxValue;

    @Column(columnDefinition = "text")
    private String description;

    public Metric(String name, Double minValue, Double maxValue, String description) {
        this.name = name;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.description = description;
    }
}
