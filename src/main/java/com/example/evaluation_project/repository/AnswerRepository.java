package com.example.evaluation_project.repository;

import com.example.evaluation_project.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    Answer findFirstByQuestionId(Long questionId);
}
