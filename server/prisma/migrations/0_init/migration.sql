-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default_tenant',
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'trainee',
    `supervisor_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `refresh_token_hash` VARCHAR(255) NOT NULL,
    `family_id` VARCHAR(64) NOT NULL,
    `device_info` VARCHAR(255) NULL,
    `ip_address` VARCHAR(50) NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_family_id_idx`(`family_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default_tenant',
    `user_id` INTEGER NOT NULL,
    `entry_date` VARCHAR(20) NOT NULL,
    `time_from` VARCHAR(10) NOT NULL,
    `time_to` VARCHAR(10) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'أخرى',
    `description` TEXT NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `entries_user_id_entry_date_idx`(`user_id`, `entry_date`),
    INDEX `entries_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_revisions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_id` INTEGER NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `time_from` VARCHAR(10) NOT NULL,
    `time_to` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_profile` (
    `user_id` INTEGER NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default_tenant',
    `student_name` VARCHAR(100) NOT NULL DEFAULT '',
    `training_number` VARCHAR(50) NOT NULL DEFAULT '',
    `department` VARCHAR(100) NOT NULL DEFAULT '',
    `training_unit` VARCHAR(150) NOT NULL DEFAULT '',
    `supervisor_name` VARCHAR(100) NOT NULL DEFAULT '',
    `responsible_name` VARCHAR(100) NOT NULL DEFAULT '',
    `entity_address` VARCHAR(200) NOT NULL DEFAULT '',
    `employees_count` VARCHAR(50) NOT NULL DEFAULT '',
    `training_weeks` INTEGER NOT NULL DEFAULT 14,
    `course_hours` INTEGER NOT NULL DEFAULT 280,
    `start_date` VARCHAR(20) NOT NULL DEFAULT '',
    `company_logo` MEDIUMTEXT NULL,
    `institution_logo` MEDIUMTEXT NULL,
    `report_template` VARCHAR(50) NOT NULL DEFAULT 'royal',
    `executive_summary` TEXT NULL,
    `challenges_text` TEXT NULL,
    `recommendations_text` TEXT NULL,
    `intro_text` TEXT NULL,
    `entity_intro_text` TEXT NULL,
    `skills_text` TEXT NULL,
    `conclusion_text` TEXT NULL,
    `supervisor_notes` TEXT NULL,
    `supervisor_rating` VARCHAR(50) NOT NULL DEFAULT '',
    `supervisor_approved` BOOLEAN NOT NULL DEFAULT false,
    `supervisor_approved_at` DATETIME(3) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `verification_hash` VARCHAR(64) NULL,

    INDEX `report_profile_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_status_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_id` INTEGER NOT NULL,
    `actor_id` INTEGER NOT NULL,
    `from_status` VARCHAR(50) NOT NULL,
    `to_status` VARCHAR(50) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_status_history_report_id_idx`(`report_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_section_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_id` INTEGER NOT NULL,
    `supervisor_id` INTEGER NOT NULL,
    `section_key` VARCHAR(50) NOT NULL,
    `comment` TEXT NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_section_comments_report_id_section_key_idx`(`report_id`, `section_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_evidence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default_tenant',
    `user_id` INTEGER NOT NULL,
    `week_index` INTEGER NOT NULL,
    `caption` VARCHAR(255) NOT NULL,
    `image_data` MEDIUMTEXT NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `weekly_evidence_user_id_week_index_idx`(`user_id`, `week_index`),
    INDEX `weekly_evidence_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default_tenant',
    `user_id` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(50) NULL,
    `metadata` TEXT NULL,
    `ip_address` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_tenant_id_created_at_idx`(`tenant_id`, `created_at`),
    INDEX `audit_logs_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_usage_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default_tenant',
    `user_id` INTEGER NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `tokens_in` INTEGER NOT NULL DEFAULT 0,
    `tokens_out` INTEGER NOT NULL DEFAULT 0,
    `cost_estimate` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_usage_logs_tenant_id_created_at_idx`(`tenant_id`, `created_at`),
    INDEX `ai_usage_logs_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entries` ADD CONSTRAINT `entries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_revisions` ADD CONSTRAINT `entry_revisions_entry_id_fkey` FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_profile` ADD CONSTRAINT `report_profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_status_history` ADD CONSTRAINT `report_status_history_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `report_profile`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_section_comments` ADD CONSTRAINT `report_section_comments_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `report_profile`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_evidence` ADD CONSTRAINT `weekly_evidence_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_usage_logs` ADD CONSTRAINT `ai_usage_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

