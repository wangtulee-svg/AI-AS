-- ============================================
-- UNIVERSITY AI ASSISTANT - DATABASE SCHEMA
-- ============================================

-- 1. ຕາຕະລາງ Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) UNIQUE,
    faculty VARCHAR(50),
    year_of_study INT DEFAULT 1,
    profile_picture VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    role ENUM('student', 'lecturer', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_student_id (student_id)
);

-- 2. ຕາຕະລາງ Subjects (ວິຊາ)
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT DEFAULT 3,
    faculty VARCHAR(50),
    semester INT,
    year INT,
    lecturer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_faculty (faculty)
);

-- 3. ຕາຕະລາງ Enrollments (ການລົງທະບຽນຮຽນ)
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester VARCHAR(20),
    grade VARCHAR(5),
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, subject_id, semester),
    INDEX idx_user_subject (user_id, subject_id)
);

-- 4. ຕາຕະລາງ Documents (ເອກະສານ)
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    summary TEXT,
    keywords TEXT,
    subject_id INT,
    uploaded_by INT NOT NULL,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject (subject_id),
    INDEX idx_uploader (uploaded_by),
    FULLTEXT INDEX idx_search (title, description, summary, keywords)
);

-- 5. ຕາຕະລາງ Quizzes
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id INT,
    created_by INT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    total_questions INT DEFAULT 0,
    time_limit INT, -- ນາທີ
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject (subject_id)
);

-- 6. ຕາຕະລາງ Questions (ຄຳຖາມໃນ Quiz)
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    marks INT DEFAULT 1,
    question_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id)
);

-- 7. ຕາຕະລາງ ChatHistory (ປະຫວັດການສົນທະນາ)
CREATE TABLE chat_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(100),
    message TEXT NOT NULL,
    response TEXT,
    context JSON,
    subject_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    INDEX idx_user_session (user_id, session_id),
    INDEX idx_created_at (created_at)
);

-- 8. ຕາຕະລາງ Timetable (ຕາຕະລາງຮຽນ)
CREATE TABLE timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    day_of_week ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    semester VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_user_day (user_id, day_of_week),
    UNIQUE KEY unique_schedule (user_id, day_of_week, start_time, end_time)
);

-- 9. ຕາຕະລາງ Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- 10. ຕາຕະລາງ SystemLogs
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- INSERT ຂໍ້ມູນຕົວຢ່າງ
-- ============================================

-- ເພີ່ມຜູ້ໃຊ້ທົດສອບ (password: 123456)
INSERT INTO users (email, password_hash, full_name, student_id, faculty, role) 
VALUES ('admin@university.edu', '$2a$10$YourHashedPasswordHere', 'Admin User', 'STU001', 'Engineering', 'admin');

-- ເພີ່ມວິຊາຕົວຢ່າງ
INSERT INTO subjects (code, name, description, credits, faculty, semester, year) VALUES
('CS101', 'Introduction to Computer Science', 'ພື້ນຖານວິທະຍາສາດຄອມພິວເຕີ ລວມທັງການຂຽນໂປຣແກຣມ', 3, 'Engineering', 1, 2024),
('CS201', 'Data Structures', 'ໂຄງສ້າງຂໍ້ມູນ ແລະ ອະລະກອລິທຶມ', 3, 'Engineering', 2, 2024),
('MA101', 'Calculus I', 'ແຄລຄູລັດ 1 ສຳລັບວິສະວະກຳ', 4, 'Science', 1, 2024),
('EN101', 'English for Academic Purposes', 'ພາສາອັງກິດເພື່ອການສຶກສາ', 2, 'Humanities', 1, 2024);