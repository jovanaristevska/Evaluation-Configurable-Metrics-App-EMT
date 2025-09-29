package com.example.evaluation_project.repository;

import com.example.evaluation_project.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByWorkspaceId(Long workspaceId);
}
