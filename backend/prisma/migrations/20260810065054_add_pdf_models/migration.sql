-- CreateTable
CREATE TABLE `pdf_documents` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `pages` INTEGER NULL,
    `summary` VARCHAR(191) NULL,
    `summary_lao` VARCHAR(191) NULL,
    `summary_eng` VARCHAR(191) NULL,
    `uploaded_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pdf_documents_uploaded_by_idx`(`uploaded_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pdf_questions` (
    `id` VARCHAR(191) NOT NULL,
    `pdf_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'both',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pdf_questions_pdf_id_idx`(`pdf_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pdf_quizzes` (
    `id` VARCHAR(191) NOT NULL,
    `pdf_id` VARCHAR(191) NOT NULL,
    `questions` JSON NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'both',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pdf_quizzes_pdf_id_idx`(`pdf_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pdf_documents` ADD CONSTRAINT `pdf_documents_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pdf_questions` ADD CONSTRAINT `pdf_questions_pdf_id_fkey` FOREIGN KEY (`pdf_id`) REFERENCES `pdf_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pdf_quizzes` ADD CONSTRAINT `pdf_quizzes_pdf_id_fkey` FOREIGN KEY (`pdf_id`) REFERENCES `pdf_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
