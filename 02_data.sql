INSERT INTO public.configurations (name) VALUES
                                             ('Configuration1'),
                                             ('Configuration2'),
                                             ('Configuration3');

INSERT INTO public.workspaces (name, created_at, configuration_id) VALUES
                                                                       ('Workspace A', now(), 1),
                                                                       ('Workspace B', now(), 2);

INSERT INTO public.metrics (name, min_value, max_value, description) VALUES
                                                            ('accuracy', 0, 5, 'Measures factual correctness'),
                                                            ('comprehensiveness', 0, 5, 'Evaluates completeness of information'),
                                                            ('clarity', 0, 5, 'Assesses how clear and understandable the content is'),
                                                            ('empathy', 0, 5, 'Measures emotional understanding and response'),
                                                            ('bias', 0, 5, 'Evaluates presence of unfair prejudice'),
                                                            ('harm', 0, 5, 'Assesses potential to cause harm'),
                                                            ('understanding', 0, 5, 'Measures grasp of the subject matter'),
                                                            ('relevance', 0, 5, 'Evaluates how pertinent the information is'),
                                                            ('currency', 0, 5, 'Assesses if information is up-to-date'),
                                                            ('reasoning', 0, 5, 'Evaluates logical thought process'),
                                                            ('factuality_verification', 0, 5, 'Checks if facts can be verified'),
                                                            ('fabrication', 0, 5, 'Detects if information is intentionally fabricated'),
                                                            ('conciseness', 0, 5, 'Evaluates brevity without losing meaning'),
                                                            ('tone', 0, 5, 'Assesses appropriateness of tone for context'),
                                                            ('coherence', 0, 5, 'Measures logical flow and consistency'),
                                                            ('engagement', 0, 5, 'Evaluates ability to capture and keep interest'),
                                                            ('correctness', 0, 5, 'Assesses grammatical and semantic correctness'),
                                                            ('structure', 0, 5, 'Evaluates logical and organized structure of the response'),
                                                            ('source_citation', 0, 5, 'Checks whether sources are cited or referenced'),
                                                            ('plagiarism', 0, 5, 'Evaluates whether the content improperly copies or uses others’ work without proper attribution');
INSERT INTO public.configuration_metrics (configuration_id, metric_id, position, scale) VALUES
(1, 1, 1, '1-5'),
(1, 2, 2, '1-5'),
(1, 3, 3, '1-5'),
(1, 4, 4, '1-5'),
(1, 5, 5, '0-1'),


(2, 6, 1, '0-1'),
(2, 11, 2, '1-5'),
(2, 12, 3, '0-1'),
(2, 10, 4, '1-5'),
(2, 9, 5, '1-5'),

(3, 1, 1, '1-5'),
(3, 7, 2, '1-5'),
(3, 8, 3, '1-5'),
(3, 9, 4, '1-5'),
(3, 10, 5, '1-5');

INSERT INTO public.hef_users (username, password) VALUES
 ('admin', '$2a$10$kV/yZN5Hbxqa0VD69S8ZX.oyr2XkxMGZqdyjC9ikjLphm1Jr.Xj4K');



