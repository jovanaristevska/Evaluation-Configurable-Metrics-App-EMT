package com.example.evaluation_project.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "hef_users", schema = "public")
public class HefUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;
}
