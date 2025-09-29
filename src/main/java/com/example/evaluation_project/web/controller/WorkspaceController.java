package com.example.evaluation_project.web.controller;

import com.example.evaluation_project.dto.*;
import com.example.evaluation_project.model.*;
import com.example.evaluation_project.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceRepository workspaceRepository;
    private final ConfigurationRepository configurationRepository;
    private final MetricRepository metricRepository;
    private final QuestionRepository questionRepository;
    private final ModelRepository modelRepository;
    private final AnswerRepository answerRepository;

    public WorkspaceController(WorkspaceRepository workspaceRepository, ConfigurationRepository configurationRepository, MetricRepository metricRepository, QuestionRepository questionRepository, ModelRepository modelRepository, AnswerRepository answerRepository) {
        this.workspaceRepository = workspaceRepository;
        this.configurationRepository = configurationRepository;
        this.metricRepository = metricRepository;
        this.questionRepository = questionRepository;
        this.modelRepository = modelRepository;
        this.answerRepository = answerRepository;
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@RequestBody CreateWorkspaceRequest request) {
        if (workspaceRepository.existsByName(request.name())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Workspace with the name '" + request.name() + "' already exists.");
        }

        Configuration configuration = configurationRepository.findById(request.configurationId())
                .orElse(null);

        if (configuration == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Workspace workspace = new Workspace();
        workspace.setName(request.name());
        workspace.setCreatedAt(LocalDateTime.now());
        workspace.setConfiguration(configuration);

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceDto dto = WorkspaceMapper.toDto(savedWorkspace);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

//    @PostMapping("/with-new-configuration")
//    public ResponseEntity<?> createWithNewConfig(@RequestBody CreateWorkspaceWithConfigurationRequest req) {
//        if (workspaceRepository.existsByName(req.workspaceName())) {
//            return ResponseEntity
//                    .status(HttpStatus.CONFLICT)
//                    .body("Workspace with the name '" + req.workspaceName() + "' already exists.");
//        }
//
//        Configuration config = new Configuration();
//        config.setName(req.configurationName());
//
//        List<ConfigurationMetric> configMetrics = req.metrics().stream().map(metricDto -> {
//            Metric metric = metricRepository.findById(metricDto.metricId()).orElseThrow();
//            ConfigurationMetric cm = new ConfigurationMetric();
//            cm.setMetric(metric);
//            cm.setConfiguration(config);
//            cm.setPosition(metricDto.position());
//            cm.setScale(metricDto.scale());
//            return cm;
//        }).toList();
//
//        config.setConfigurationMetrics(configMetrics);
//        configurationRepository.save(config);
//
//        Workspace workspace = new Workspace();
//        workspace.setName(req.workspaceName());
//        workspace.setCreatedAt(LocalDateTime.now());
//        workspace.setConfiguration(config);
//
//        Workspace saved = workspaceRepository.save(workspace);
//        WorkspaceDto dto = WorkspaceMapper.toDto(saved);
//        return ResponseEntity.ok(dto);
//    }

    @PostMapping("/with-new-configuration")
    public ResponseEntity<?> createWithNewConfig(@RequestBody CreateWorkspaceWithConfigurationRequest req) {
        try {
            if (workspaceRepository.existsByName(req.workspaceName())) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Workspace with the name '" + req.workspaceName() + "' already exists.");
            }

            // 1️⃣ Create configuration and link metrics
            Configuration config = new Configuration();
            config.setName(req.configurationName());

            List<ConfigurationMetric> configMetrics = req.metrics().stream().map(metricDto -> {
                Metric metric = metricRepository.findById(metricDto.metricId()).orElseThrow();
                ConfigurationMetric cm = new ConfigurationMetric();
                cm.setMetric(metric);
                cm.setConfiguration(config);
                cm.setPosition(metricDto.position());
                cm.setScale(metricDto.scale());
                return cm;
            }).toList();

            config.setConfigurationMetrics(configMetrics);
            configurationRepository.save(config);

            // 2️⃣ Create workspace
            Workspace workspace = new Workspace();
            workspace.setName(req.workspaceName());
            workspace.setCreatedAt(LocalDateTime.now());
            workspace.setConfiguration(config);

            Workspace savedWorkspace = workspaceRepository.save(workspace);

            // 3️⃣ Create questions and answers from entries
            if (req.entries() != null) {
                for (QuestionAnswerDto entry : req.entries()) {
                    Question question = new Question();
                    question.setText(entry.question());
                    question.setWorkspace(savedWorkspace);
                    questionRepository.save(question);

                    Answer answer = new Answer();
                    answer.setText(entry.answer());
                    answer.setWorkspace(savedWorkspace);
                    answer.setQuestion(question);

                    if (entry.model() != null) {
                        Model model = modelRepository.findByName(entry.model())
                                .orElseGet(() -> {
                                    Model m = new Model();
                                    m.setName(entry.model());
                                    m.setWorkspace(savedWorkspace);
                                    return modelRepository.save(m);
                                });
                        answer.setModel(model);
                    }

                    answerRepository.save(answer);
                }
            }

            // 4️⃣ Build DTO including questions/answers to send to frontend
            ImportedWorkspaceDto dto = new ImportedWorkspaceDto(
                    savedWorkspace.getId(),
                    savedWorkspace.getName(),
                    req.entries()  // send entries so /evaluate has them
            );

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create workspace with configuration: " + e.getMessage());
        }
    }


    @PostMapping("/import")
    public ResponseEntity<?> importWorkspace(@RequestParam  Long configId,@RequestBody ImportedWorkspaceDto request) {

        if (workspaceRepository.existsByName(request.name())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Workspace with the name '" + request.name() + "' already exists.");
        }

        try {

            Configuration configuration = configurationRepository.findById(configId)
                    .orElse(null);

            if (configuration == null) {
                return ResponseEntity.badRequest().body(null);
            }

            Workspace workspace = new Workspace();
            workspace.setName(request.name());
            workspace.setCreatedAt(LocalDateTime.now());
            workspace.setConfiguration(configuration);
            workspaceRepository.save(workspace);

            for (QuestionAnswerDto entry : request.entries()) {
                Question question = new Question();
                question.setText(entry.question());
                question.setWorkspace(workspace);
                questionRepository.save(question);

                Answer answer = new Answer();
                answer.setText(entry.answer());
                answer.setWorkspace(workspace);
                answer.setQuestion(question);

                if (entry.model() != null) {
                    Model model = modelRepository.findByName(entry.model())
                            .orElseGet(() -> {
                                Model m = new Model();
                                m.setName(entry.model());
                                m.setWorkspace(workspace);
                                return modelRepository.save(m);
                            });
                    answer.setModel(model);
                }

                answerRepository.save(answer);
            }

            ImportedWorkspaceDto dto = new ImportedWorkspaceDto(
                    workspace.getId(),
                    workspace.getName(),
                    request.entries()

            );

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Failed to import workspace: " + e.getMessage());
        }
    }


    @GetMapping("/{id}/qa")
    public ResponseEntity<List<QuestionAnswerDto>> getQuestionsAndAnswers(@PathVariable Long id) {
        List<Question> questions = questionRepository.findByWorkspaceId(id);

        List<QuestionAnswerDto> dtos = questions.stream().map(q -> {
            Answer answer = answerRepository.findFirstByQuestionId(q.getId());
            return new QuestionAnswerDto(q.getText(), answer != null ? answer.getText() : null,
                    answer != null && answer.getModel() != null ? answer.getModel().getName() : null);
        }).toList();

        return ResponseEntity.ok(dtos);
    }


}
