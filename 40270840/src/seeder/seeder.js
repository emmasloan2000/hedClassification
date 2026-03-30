import db from '../config/db.js';
import bcrypt from 'bcrypt';

//allows for extensibility, rather tat hashing each password one by one
const usersToSeed = [
    {username: 'registry_admin', password: 'QUB2026', role_id: 1},
    {username: 'class_officer1', password: 'Queens2026', role_id: 2},
    {username: 'class_officer2', password: 'password', role_id: 2},
    {username: 'class_officer3', password: 'officer3', role_id: 2},
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
    programme_name VARCHAR(255) NOT NULL 
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL,  
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    student_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL, 
    last_name VARCHAR(100) NOT NULL, 
    current_level INT NOT NULL, 
    programme_id INT,
    FOREIGN KEY (programme_id) REFERENCES programmes(id)
);

CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL, 
    credits INT NOT NULL DEFAULT 20,
    level INT NOT NULL,
    programme_id INT,
    FOREIGN KEY (programme_id) REFERENCES programmes(id)
);

CREATE TABLE user_programmes (
    user_id INT,
    programme_id INT,
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
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (module_id) REFERENCES modules(id)
);
`;

const seedData = async () => {

    try{
        console.log("starting seeding...");

    const dataSQL = `
    
    INSERT INTO roles (role_name) VALUES ('Registry Officer'), ('Classification Officer');

 
    INSERT INTO programmes (programme_name) VALUES 
    ('BSc Computer Science'), 
    ('BA Fine Art');


    --  Modules for BSc Computer Science (Ensuring 120 credits per level) 
    
    -- Level 1 (Year 1: Pass only, no contribution to classification)
    INSERT INTO modules (module_name, credits, level, programme_id) VALUES 
    ('Programming 101', 20, 1, 1), ('Computing Theory', 20, 1, 1), 
    ('Mathematics for CS', 20, 1, 1), ('Web Foundations', 20, 1, 1), 
    ('Networking Basics', 20, 1, 1), ('Professional Practice', 20, 1, 1);

    -- Level 2 (Year 2: 30% Weighting)
    INSERT INTO modules (module_name, credits, level, programme_id) VALUES 
    ('Data Structures', 20, 2, 1), ('Software Engineering', 20, 2, 1), 
    ('Database Systems', 20, 2, 1), ('Algorithms', 20, 2, 1), 
    ('Systems Architecture', 20, 2, 1), ('Object Oriented Design', 20, 2, 1);

    -- Level 3 (Year 3: 70% Weighting)
    INSERT INTO modules (module_name, credits, level, programme_id) VALUES 
    ('Honours Project', 40, 3, 1), ('Machine Learning', 20, 3, 1), 
    ('Concurrent Systems', 20, 3, 1), ('Cyber Security', 20, 3, 1), 
    ('User Experience', 20, 3, 1);

    --  Modules for BA Fine Art (programme_id: 2)

    -- Level 1 (Year 1: Pass only)
    INSERT INTO modules (module_name, credits, level, programme_id) VALUES 
    ('Introduction to Studio Practice', 20, 1, 2), 
    ('Art History: Renaissance to Modern', 20, 1, 2), 
    ('Drawing & Observation', 20, 1, 2), 
    ('Digital Media in Art', 20, 1, 2), 
    ('Color Theory & Application', 20, 1, 2), 
    ('Critical Thinking in Art', 20, 1, 2);

    -- Level 2 (Year 2: 30% Weighting)
    INSERT INTO modules (module_name, credits, level, programme_id) VALUES 
    ('Contemporary Art Theory', 20, 2, 2), 
    ('Intermediate Studio Practice', 20, 2, 2), 
    ('Sculpture & Spatial Design', 20, 2, 2), 
    ('Printmaking Techniques', 20, 2, 2), 
    ('Photography as Art', 20, 2, 2), 
    ('Professional Art Practice', 20, 2, 2);

    -- Level 3 (Year 3: 70% Weighting)
    INSERT INTO modules (module_name, credits, level, programme_id) VALUES 
    ('Final Degree Exhibition', 40, 3, 2), 
    ('Curatorial Studies', 20, 3, 2), 
    ('Global Perspectives in Art', 20, 3, 2), 
    ('Advanced Studio Research', 20, 3, 2), 
    ('Art & The Public Sphere', 20, 3, 2);

    
    INSERT INTO students (student_number, first_name, last_name, current_level, programme_id) VALUES 
    ('40175341', 'Laura', 'Smith', 3, 1);

    -- Year 1 
    INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
    (1, 1, 60, 0), (1, 2, 60, 0), (1, 3, 60, 0), (1, 4, 60, 0), (1, 5, 60, 0), (1, 6, 60, 0);
    
    -- Year 2
    INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
    (1, 7, 70, 0), (1, 8, 70, 0), (1, 9, 70, 0), (1, 10, 70, 0), (1, 11, 70, 0), (1, 12, 70, 0);
    
    -- Year 3 
    INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
    (1, 13, 80, 0), (1, 14, 80, 0), (1, 15, 80, 0), (1, 16, 80, 0), (1, 17, 80, 0);

    
    -- Insert students
    INSERT INTO students (student_number, first_name, last_name, current_level, programme_id) VALUES 
    ('40175342', 'James', 'Brown', 3, 1),
    ('40175343', 'Emily', 'Davis', 3, 1),
    ('40175344', 'Michael', 'Wilson', 3, 1),
    ('40175345', 'Sarah', 'Miller', 3, 1),
    ('40175346', 'David', 'Moore', 3, 1),
    ('40175347', 'Jessica', 'Taylor', 3, 1),
    ('40175348', 'Daniel', 'Anderson', 3, 1),
    ('40175349', 'Sophie', 'Thomas', 3, 1),
    ('40175350', 'Ryan', 'Jackson', 3, 1),
    ('40175351', 'Chloe', 'White', 3, 1),
    ('40175352', 'Liam', 'Vance', 3, 2),
    ('40175353', 'Chloe', 'Bennet', 3, 2),
    ('40175354', 'Marcus', 'Reed', 3, 2);

   

    
    INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES 
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
        `;

        await db.query(schemaSQL);
        console.log("Tables reset and created");

            await db.query(dataSQL)
                console.log("All data seeded successfully");

        for (let user of usersToSeed){
            const hashedPass = await bcrypt.hash(user.password, 10);
            const userSQL = `INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)`;
            await db.query(userSQL, [user.username, hashedPass, user.role_id]);

        }

        await db.query(`INSERT INTO user_programmes (user_id, programme_id) VALUES (2, 1)`)
        
                process.exit(0);
            
    

    } catch (error) {
        console.log("seeding failed", error);
        process.exit(1);
    }

};

seedData();