import db from '../config/db.js';
import bcrypt from 'bcrypt';

//allows for extensibility, rather tat hashing each password one by one
const usersToSeed = [
    { first_name: 'Ellie', last_name: 'Smith', username: 'registry_admin', password: 'QUB2026', role_id: 1 },
    { first_name: 'John', last_name: 'Rooney', username: 'class_officer1', password: 'Queens2026', role_id: 2 },
    { first_name: 'Elena', last_name: 'Gilbert', username: 'class_officer2', password: 'password', role_id: 2 },
    { first_name: 'Meredith', last_name: 'Gray', username: 'class_officer3', password: 'officer3', role_id: 2 },
];

const schemaSQL = `
-- DROP in reverse order of dependencies
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS user_programmes;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS programmes;
DROP TABLE IF EXISTS roles;


CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL  
);

CREATE TABLE programmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    programme_name VARCHAR(255) NOT NULL,
    award_type VARCHAR(10) NOT NULL,
    pathway VARCHAR(100) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    y1_weight DECIMAL (3,2) DEFAULT 0.00,
    y2_weight DECIMAL (3,2) DEFAULT 0.30,
    y3_weight DECIMAL (3,2) DEFAULT 0.70,
    min_1st INT DEFAULT 70,
    min_2_1 INT DEFAULT 60,
    min_2_2 INT DEFAULT 50,
    min_3rd INT DEFAULT 40,
    resit_capped BOOLEAN DEFAULT TRUE,
    max_failed_credits_allowed INT DEFAULT 0,
    min_compensation_mark INT DEFAULT 40,
    dissertation_min_pass INT DEFAULT 40,
    is_deleted BOOLEAN DEFAULT 0

);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL,  
    role_id INT,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    student_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL, 
    last_name VARCHAR(100) NOT NULL, 
    current_level INT NOT NULL, 
    programme_id INT,
    mitigating_circumstances BOOLEAN,
    cohort_year VARCHAR(9),
    proposed_classification VARCHAR(50),
    final_classification VARCHAR(50),
    is_manual_override BOOLEAN,
    rationale VARCHAR(1000),
    review_status VARCHAR(50),
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (programme_id) REFERENCES programmes(id)
);

CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_code VARCHAR(50),
    module_name VARCHAR(255) NOT NULL, 
    credits INT NOT NULL DEFAULT 20,
    level INT NOT NULL,
    programme_id INT,
    FOREIGN KEY (programme_id) REFERENCES programmes(id)
);

CREATE TABLE user_programmes (
    user_id INT,
    programme_id INT,
    academic_year VARCHAR(9),
    PRIMARY KEY (user_id, programme_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (programme_id) REFERENCES programmes(id)
);

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Grades [cite: 16]
    student_id INT,
    module_id INT,
    mark DECIMAL(5,2),
    is_resit BOOLEAN DEFAULT FALSE,
    UNIQUE (student_id, module_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (module_id) REFERENCES modules(id)
);
`;

const seedData = async () => {

    try {
        console.log("starting seeding...");

        const dataSQL = `
    
    INSERT INTO roles (role_name) VALUES ('Registry Officer'), ('Classification Officer');

 
    INSERT INTO programmes (programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass) 
    VALUES 
    
    ('Computer Science', 'BSc', 'Single Honours', '2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 20, 30, 40),

   
    ('Fine Art', 'BA', 'Single Honours', '2025/2026', 0.00, 0.50, 0.50, 70, 60, 50, 40, FALSE, 0, 40, 30),

    
    ('Mathematics', 'BSc', 'Single Honours', '2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40),
    ('Mathematics', 'BSc', 'with Placement Year','2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40),
    ('French', 'BA', 'Single Honours', '2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40),
    ('French', 'BA', 'with Spanish', '2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40),
    ('History', 'BA', 'Single Honours', '2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40),
    ('Psychology', 'BSc', 'Single Honours', '2025/2026', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40),
    ('Computer Science', 'BSc', 'Single Honours', '2026/2027', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 20, 30, 40),
    ('Mathematics', 'BSc', 'Single Honours', '2026/2027', 0.00, 0.30, 0.70, 70, 60, 50, 40, TRUE, 0, 40, 40);
    



  -- Level 1
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('CS101', 'Programming 101', 20, 1, 1), 
('CS102', 'Computing Theory', 20, 1, 1), 
('CS103', 'Mathematics for CS', 20, 1, 1), 
('CS104', 'Web Foundations', 20, 1, 1), 
('CS105', 'Networking Basics', 20, 1, 1), 
('CS106', 'Professional Practice', 20, 1, 1);

-- Level 2
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('CS201', 'Data Structures', 20, 2, 1), 
('CS202', 'Software Engineering', 20, 2, 1), 
('CS203', 'Database Systems', 20, 2, 1), 
('CS204', 'Algorithms', 20, 2, 1), 
('CS205', 'Systems Architecture', 20, 2, 1), 
('CS206', 'Object Oriented Design', 20, 2, 1);

-- Level 3
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('CS301', 'Honours Project', 40, 3, 1), 
('CS302', 'Machine Learning', 20, 3, 1), 
('CS303', 'Concurrent Systems', 20, 3, 1), 
('CS304', 'Cyber Security', 20, 3, 1), 
('CS305', 'User Experience', 20, 3, 1);

 -- Level 1
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('FA101', 'Introduction to Studio Practice', 20, 1, 2), 
('FA102', 'Art History: Renaissance to Modern', 20, 1, 2), 
('FA103', 'Drawing & Observation', 20, 1, 2), 
('FA104', 'Digital Media in Art', 20, 1, 2), 
('FA105', 'Color Theory & Application', 20, 1, 2), 
('FA106', 'Critical Thinking in Art', 20, 1, 2);

-- Level 2
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('FA201', 'Contemporary Art Theory', 20, 2, 2), 
('FA202', 'Intermediate Studio Practice', 20, 2, 2), 
('FA203', 'Sculpture & Spatial Design', 20, 2, 2), 
('FA204', 'Printmaking Techniques', 20, 2, 2), 
('FA205', 'Photography as Art', 20, 2, 2), 
('FA206', 'Professional Art Practice', 20, 2, 2);

-- Level 3
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('FA301', 'Final Degree Exhibition', 40, 3, 2), 
('FA302', 'Curatorial Studies', 20, 3, 2), 
('FA303', 'Global Perspectives in Art', 20, 3, 2), 
('FA304', 'Advanced Studio Research', 20, 3, 2), 
('FA305', 'Art & The Public Sphere', 20, 3, 2);

 -- Level 1
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('MA101', 'Calculus I', 20, 1, 3),
('MA102', 'Linear Algebra I', 20, 1, 3),
('MA103', 'Probability and Statistics', 20, 1, 3),
('MA104', 'Discrete Mathematics', 20, 1, 3),
('MA105', 'Mathematical Proofs and Logic', 20, 1, 3),
('MA106', 'Computational Mathematics', 20, 1, 3);

-- Level 2
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('MA201', 'Multivariable Calculus', 20, 2, 3),
('MA202', 'Abstract Algebra', 20, 2, 3),
('MA203', 'Real Analysis', 20, 2, 3),
('MA204', 'Differential Equations', 20, 2, 3),
('MA205', 'Numerical Methods', 20, 2, 3),
('MA206', 'Vector Analysis', 20, 2, 3);

-- Level 3
INSERT INTO modules (module_code, module_name, credits, level, programme_id) VALUES 
('MA301', 'Complex Analysis', 20, 3, 3),
('MA302', 'Number Theory', 20, 3, 3),
('MA303', 'Topology', 20, 3, 3),
('MA304', 'Fluid Mechanics', 20, 3, 3),
('MA305', 'Stochastic Processes', 20, 3, 3),
('MA306', 'Mathematics Dissertation', 20, 3, 3);


INSERT INTO students (
    student_number, 
    first_name, 
    last_name, 
    current_level, 
    programme_id, 
    mitigating_circumstances,
    cohort_year,
    proposed_classification,
    final_classification,
    is_manual_override,
    rationale,
    review_status
) VALUES 
('40175341', 'Laura', 'Smith', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175342', 'James', 'Brown', 3, 1, 1, '2025/2026', NULL, NULL, 0, NULL, 'Flagged'),
('40175343', 'Emily', 'Davis', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Approved'),
('40175344', 'Michael', 'Wilson', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Approved'),
('40175345', 'Sarah', 'Miller', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175346', 'David', 'Moore', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Approved'),
('40175347', 'Jessica', 'Taylor', 3, 1, 1, '2025/2026', NULL, NULL, 0, NULL, 'Flagged'),
('40175348', 'Daniel', 'Anderson', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175349', 'Sophie', 'Thomas', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175350', 'Ryan', 'Jackson', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175351', 'Chloe', 'White', 3, 1, 0, '2025/2026', NULL, NULL, 0, NULL, 'Approved'),
('40175352', 'Liam', 'Vance', 3, 2, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175353', 'Chloe', 'Bennet', 3, 2, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40175354', 'Marcus', 'Reed', 3, 2, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval');

INSERT INTO students (
    student_number, 
    first_name, 
    last_name, 
    current_level, 
    programme_id, 
    mitigating_circumstances,
    cohort_year,
    proposed_classification,
    final_classification,
    is_manual_override,
    rationale,
    review_status
) VALUES 
('40200101', 'Alice', 'Wonder', 3, 3, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40200102', 'Bob', 'Smith', 3, 3, 1, '2025/2026', NULL, NULL, 0, NULL, 'Flagged'),
('40200103', 'Charlie', 'Allen', 3, 3, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40200104', 'Daisy', 'Miller', 3, 3, 0, '2025/2026', NULL, NULL, 0, NULL, 'Approved'),
('40200105', 'Edward', 'Eddie', 3, 3, 1, '2025/2026', NULL, NULL, 0, NULL, 'Flagged'),
('40200106', 'Fiona', 'Gallagher', 3, 3, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval'),
('40200107', 'George', 'Hargreeves', 3, 3, 0, '2025/2026', NULL, NULL, 0, NULL, 'Awaiting Approval');

INSERT INTO students (
    student_number, 
    first_name, 
    last_name, 
    current_level, 
    programme_id, 
    mitigating_circumstances,
    cohort_year,
    proposed_classification,
    final_classification,
    is_manual_override,
    rationale,
    review_status
) VALUES 
-- Programme 3 (Mathematics) - Level 2
('40200201', 'Oliver', 'Graham', 2, 10, 0, '2026/2027', NULL, NULL, 0, NULL, NULL),
('40200202', 'Bella', 'Swan', 2, 10, 0, '2026/2027', NULL, NULL, 0, NULL, NULL),
('40200203', 'Kevin', 'Hughes', 2, 10, 1, '2026/2027', NULL, NULL, 0, NULL, NULL),
('40200204', 'Diana', 'Roberts', 2, 10, 0, '2026/2027', NULL, NULL, 0, NULL, NULL),

-- Programme 1 (Computer Science) - Level 2
('40100201', 'Elliot', 'Billie', 2, 9, 0, '2026/2027', NULL, NULL, 0, NULL, NULL),
('40100202', 'Angela', 'Trainer', 2, 9, 0, '2026/2027', NULL, NULL, 0, NULL, NULL),
('40100203', 'Tyrell', 'Wells', 2, 9, 0, '2026/2027', NULL, NULL, 0, NULL, NULL);



     -- Year 1 
    INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
    (1, 1, 60, 0), (1, 2, 65, 0), (1, 3, 60, 0), (1, 4, 68, 0), (1, 5, 60, 0), (1, 6, 62, 0),
    
    -- Year 2
    
    (1, 7, 70, 0), (1, 8, 75, 0), (1, 9, 71, 0), (1, 10, 74, 0), (1, 11, 70, 0), (1, 12, 70, 0),
    
    -- Year 3 
    
    (1, 13, 78, 0), (1, 14, 75, 0), (1, 15, 80, 0), (1, 16, 82, 0), (1, 17, 75, 0),

    -- Student 2: James Brown 
    (2, 1, 75, 0), (2, 2, 72, 0), (2, 3, 80, 0), (2, 4, 78, 0), (2, 5, 74, 0), (2, 6, 76, 0),
    (2, 7, 82, 0), (2, 8, 85, 0), (2, 9, 79, 0), (2, 10, 81, 0), (2, 11, 77, 0), (2, 12, 80, 0),
    (2, 13, 88, 0), (2, 14, 82, 0), (2, 15, 84, 0), (2, 16, 80, 0), (2, 17, 85, 0),

    -- Student 3: Emily Davis 
    (3, 1, 62, 0), (3, 2, 65, 0), (3, 3, 60, 0), (3, 4, 68, 0), (3, 5, 61, 0), (3, 6, 63, 0),
    (3, 7, 66, 0), (3, 8, 64, 0), (3, 9, 67, 0), (3, 10, 62, 0), (3, 11, 65, 0), (3, 12, 68, 0),
    (3, 13, 70, 0), (3, 14, 65, 0), (3, 15, 66, 0), (3, 16, 64, 0), (3, 17, 67, 0),

    -- Student 4: Michael Wilson 
    (4, 1, 45, 0), (4, 2, 48, 0), (4, 3, 50, 0), (4, 4, 42, 0), (4, 5, 47, 0), (4, 6, 52, 0),
    (4, 7, 55, 0), (4, 8, 58, 0), (4, 9, 60, 0), (4, 10, 62, 0), (4, 11, 65, 0), (4, 12, 63, 0),
    (4, 13, 72, 0), (4, 14, 75, 0), (4, 15, 70, 0), (4, 16, 74, 0), (4, 17, 71, 0),

    -- Student 5: Sarah Miller 
    (5, 1, 70, 0), (5, 2, 72, 0), (5, 3, 75, 0), (5, 4, 71, 0), (5, 5, 73, 0), (5, 6, 70, 0),
    (5, 7, 50, 0), (5, 8, 52, 0), (5, 9, 48, 0), (5, 10, 55, 0), (5, 11, 51, 0), (5, 12, 49, 0),
    (5, 13, 65, 0), (5, 14, 68, 0), (5, 15, 62, 0), (5, 16, 60, 0), (5, 17, 64, 0),

    -- Student 6: David Moore 
    (6, 1, 55, 0), (6, 2, 58, 0), (6, 3, 52, 0), (6, 4, 56, 0), (6, 5, 54, 0), (6, 6, 57, 0),
    (6, 7, 58, 0), (6, 8, 60, 0), (6, 9, 59, 0), (6, 10, 61, 0), (6, 11, 62, 0), (6, 12, 60, 0),
    (6, 13, 63, 0), (6, 14, 61, 0), (6, 15, 60, 0), (6, 16, 62, 0), (6, 17, 65, 0),

    -- Student 7: Jessica Taylor
    (7, 1, 85, 0), (7, 2, 88, 0), (7, 3, 90, 0), (7, 4, 82, 0), (7, 5, 84, 0), (7, 6, 86, 0),
    (7, 7, 88, 0), (7, 8, 92, 0), (7, 9, 85, 0), (7, 10, 87, 0), (7, 11, 89, 0), (7, 12, 90, 0),
    (7, 13, 95, 0), (7, 14, 91, 0), (7, 15, 88, 0), (7, 16, 92, 0), (7, 17, 94, 0),

    -- Student 8: Daniel Anderson 
    (8, 1, 40, 0), (8, 2, 42, 0), (8, 3, 56, 0), (8, 4, 40, 0), (8, 5, 41, 0), (8, 6, 43, 0),
    (8, 7, 45, 0), (8, 8, 42, 0), (8, 9, 40, 0), (8, 10, 48, 0), (8, 11, 44, 0), (8, 12, 46, 0),
    (8, 13, 50, 0), (8, 14, 35, 1), (8, 15, 52, 0), (8, 16, 51, 0), (8, 17, 49, 0),

    -- Student 9: Sophie Thomas 
    (9, 1, 60, 0), (9, 2, 55, 0), (9, 3, 70, 0), (9, 4, 65, 0), (9, 5, 58, 0), (9, 6, 62, 0),
    (9, 7, 65, 0), (9, 8, 72, 0), (9, 9, 55, 0), (9, 10, 68, 0), (9, 11, 60, 0), (9, 12, 63, 0),
    (9, 13, 70, 0), (9, 14, 75, 0), (9, 15, 62, 0), (9, 16, 68, 0), (9, 17, 71, 0),

    -- Student 10: Ryan Jackson 
    (10, 1, 52, 0), (10, 2, 54, 0), (10, 3, 51, 0), (10, 4, 53, 0), (10, 5, 55, 0), (10, 6, 52, 0),
    (10, 7, 56, 0), (10, 8, 54, 0), (10, 9, 58, 0), (10, 10, 55, 0), (10, 11, 57, 0), (10, 12, 53, 0),
    (10, 13, 58, 0), (10, 14, 56, 0), (10, 15, 59, 0), (10, 16, 57, 0), (10, 17, 60, 0),

    -- Student 11: Chloe White 
    (11, 1, 80, 0), (11, 2, 75, 0), (11, 3, 85, 0), (11, 4, 70, 0), (11, 5, 72, 0), (11, 6, 78, 0),
    (11, 7, 75, 0), (11, 8, 77, 0), (11, 9, 80, 0), (11, 10, 72, 0), (11, 11, 74, 0), (11, 12, 76, 0),
    (11, 13, 82, 0), (11, 14, 78, 0), (11, 15, 80, 0), (11, 16, 76, 0), (11, 17, 79, 0),

    -- Student 12: Liam Vance 
    (12, 18, 78, 0), (12, 19, 65, 0), (12, 20, 82, 0), (12, 21, 70, 0), (12, 22, 85, 0), (12, 23, 62, 0),
    (12, 24, 68, 0), (12, 25, 88, 0), (12, 26, 84, 0), (12, 27, 80, 0), (12, 28, 75, 0), (12, 29, 72, 0),
    (12, 30, 92, 0), -- 40-credit Final Exhibition (Massive weight)
    (12, 31, 70, 0), (12, 32, 68, 0), (12, 33, 85, 0), (12, 34, 74, 0),

    -- Student 13: Chloe Bennet 
    (13, 18, 60, 0), (13, 19, 82, 0), (13, 20, 58, 0), (13, 21, 65, 0), (13, 22, 60, 0), (13, 23, 78, 0),
    (13, 24, 85, 0), (13, 25, 62, 0), (13, 26, 55, 0), (13, 27, 58, 0), (13, 28, 64, 0), (13, 29, 66, 0),
    (13, 30, 65, 0), 
    (13, 31, 88, 0), (13, 32, 84, 0), (13, 33, 62, 0), (13, 34, 79, 0),

    -- Student 14: Marcus Reed 
    (14, 18, 62, 0), (14, 19, 64, 0), (14, 20, 63, 0), (14, 21, 65, 0), (14, 22, 61, 0), (14, 23, 66, 0),
    (14, 24, 65, 0), (14, 25, 67, 0), (14, 26, 64, 0), (14, 27, 68, 0), (14, 28, 62, 0), (14, 29, 65, 0),
    (14, 30, 68, 0), 
    (14, 31, 65, 0), (14, 32, 66, 0), (14, 33, 67, 0), (14, 34, 64, 0);

    -- Assuming Mathematics modules (Programme 3) have IDs 13-30 
-- (6 modules for Year 1, 6 for Year 2, 6 for Year 3)
-- Assuming Mathematics students have IDs 15-21

-- ALICE (Student 15) - High Marks (First Class)
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(15, 13, 75, 0), (15, 14, 78, 0), (15, 15, 80, 0), (15, 16, 72, 0), (15, 17, 70, 0), (15, 18, 74, 0), -- Y1
(15, 19, 82, 0), (15, 20, 85, 0), (15, 21, 78, 0), (15, 22, 80, 0), (15, 23, 77, 0), (15, 24, 79, 0), -- Y2 (30%)
(15, 25, 88, 0), (15, 26, 84, 0), (15, 27, 82, 0), (15, 28, 85, 0), (15, 29, 90, 0), (15, 30, 88, 0); -- Y3 (70%)

-- BOB (Student 16) - Has a Resit (Capped at 40)
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(16, 13, 50, 0), (16, 14, 55, 0), (16, 15, 45, 0), (16, 16, 48, 0), (16, 17, 52, 0), (16, 18, 50, 0), -- Y1
(16, 19, 40, 1), (16, 20, 55, 0), (16, 21, 58, 0), (16, 22, 50, 0), (16, 23, 45, 0), (16, 24, 48, 0), -- Y2
(16, 25, 52, 0), (16, 26, 50, 0), (16, 27, 55, 0), (16, 28, 58, 0), (16, 29, 60, 0), (16, 30, 55, 0); -- Y3

-- CHARLIE (Student 17) - 2:1 Level
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(17, 13, 62, 0), (17, 14, 60, 0), (17, 15, 65, 0), (17, 16, 61, 0), (17, 17, 60, 0), (17, 18, 63, 0), -- Y1
(17, 19, 65, 0), (17, 20, 68, 0), (17, 21, 62, 0), (17, 22, 64, 0), (17, 23, 66, 0), (17, 24, 67, 0), -- Y2
(17, 25, 68, 0), (17, 26, 70, 0), (17, 27, 65, 0), (17, 28, 62, 0), (17, 29, 64, 0), (17, 30, 66, 0); -- Y3

-- EDWARD (Student 19) - Borderline First/2:1 (To test Flagging)
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(19, 13, 60, 0), (19, 14, 60, 0), (19, 15, 60, 0), (19, 16, 60, 0), (19, 17, 60, 0), (19, 18, 60, 0), -- Y1
(19, 19, 68, 0), (19, 20, 69, 0), (19, 21, 68, 0), (19, 22, 69, 0), (19, 23, 68, 0), (19, 24, 69, 0), -- Y2
(19, 25, 69, 0), (19, 26, 70, 0), (19, 27, 70, 0), (19, 28, 69, 0), (19, 29, 70, 0), (19, 30, 69, 0); -- Y3

-- Fillers for Students 18 (Daisy), 20 (Fiona), 21 (George)
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
-- Daisy (Student 18)
(18, 19, 55, 0), (18, 20, 55, 0), (18, 21, 55, 0), (18, 22, 55, 0), (18, 23, 55, 0), (18, 24, 55, 0), 
(18, 25, 58, 0), (18, 26, 58, 0), (18, 27, 58, 0), (18, 28, 58, 0), (18, 29, 58, 0), (18, 30, 58, 0),
-- Fiona (Student 20)
(20, 19, 45, 0), (20, 20, 45, 0), (20, 21, 45, 0), (20, 22, 45, 0), (20, 23, 45, 0), (20, 24, 45, 0), 
(20, 25, 48, 0), (20, 26, 48, 0), (20, 27, 48, 0), (20, 28, 48, 0), (20, 29, 48, 0), (20, 30, 48, 0),
-- George (Student 21)
(21, 19, 72, 0), (21, 20, 72, 0), (21, 21, 72, 0), (21, 22, 72, 0), (21, 23, 72, 0), (21, 24, 72, 0), 
(21, 25, 75, 0), (21, 26, 75, 0), (21, 27, 75, 0), (21, 28, 75, 0), (21, 29, 75, 0), (21, 30, 75, 0);

-- Year 1  - Completed for all
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(22, 13, 65, 0), (22, 14, 60, 0), (22, 15, 70, 0), (22, 16, 55, 0), (22, 17, 62, 0), (22, 18, 60, 0), -- Oliver
(23, 13, 72, 0), (23, 14, 75, 0), (23, 15, 80, 0), (23, 16, 70, 0), (23, 17, 78, 0), (23, 18, 74, 0), -- Bella
(24, 13, 40, 1), (24, 14, 45, 0), (24, 15, 50, 0), (24, 16, 42, 0), (24, 17, 48, 0), (24, 18, 45, 0), -- Kevin (Resit)
(25, 13, 68, 0), (25, 14, 70, 0), (25, 15, 65, 0), (25, 16, 62, 0), (25, 17, 66, 0), (25, 18, 64, 0); -- Diana

-- Year 2  - Mid-year results (3 modules each)
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(22, 19, 64, 0), (22, 20, 61, 0), (22, 21, 58, 0),
(23, 21, 82, 0), (23, 22, 85, 0), (23, 23, 79, 0),
(24, 19, 35, 0), (24, 20, 42, 0), (24, 21, 40, 0), 
(25, 19, 70, 0), (25, 20, 72, 0), (25, 21, 68, 0);

-- Year 1  - Completed
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(26, 1, 90, 0), (26, 2, 95, 0), (26, 3, 88, 0), (26, 4, 92, 0), (26, 5, 85, 0), (26, 6, 88, 0), -- Elliot
(27, 1, 70, 0), (27, 2, 72, 0), (27, 3, 68, 0), (27, 4, 75, 0), (27, 5, 70, 0), (27, 6, 72, 0), -- Angela
(28, 1, 60, 0), (28, 2, 62, 0), (28, 3, 58, 0), (28, 4, 65, 0), (28, 5, 60, 0), (28, 6, 62, 0); -- Tyrell

-- Year 2  - Mid-year results
INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
(26, 7, 95, 0), (26, 8, 98, 0),
(27, 7, 75, 0), (27, 8, 78, 0),
(28, 7, 55, 0), (28, 8, 58, 0);
        `;

        await db.query(schemaSQL);
        console.log("Tables reset and created");

        await db.query(dataSQL)
        console.log("All data seeded successfully");

        for (let user of usersToSeed) {
            const hashedPass = await bcrypt.hash(user.password, 10);
            const userSQL = `INSERT INTO users (first_name, last_name, username, password, role_id) VALUES (?, ?, ?, ?, ?)`;
            await db.query(userSQL, [user.first_name, user.last_name, user.username, hashedPass, user.role_id]);

        }

        await db.query(`INSERT INTO user_programmes (user_id, programme_id, academic_year) VALUES (2, 1, '2025/2026'),
            (2, 3, '2025/2026'), (2, 2, '2025/2026'), (3, 4, '2025/2026'), (4, 5, '2025/2026');`)

        process.exit(0);



    } catch (error) {
        console.log("seeding failed", error);
        process.exit(1);
    }

};

seedData();