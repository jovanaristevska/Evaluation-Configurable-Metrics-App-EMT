package com.example.evaluation_project.repository;

import com.example.evaluation_project.model.HefUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface HefUserRepository extends JpaRepository<HefUser, Long> {
    Optional<HefUser> findByUsername(String username);
}
