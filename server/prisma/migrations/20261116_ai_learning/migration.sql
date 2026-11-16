-- CreateTable
CREATE TABLE `ai_suggestions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `task` VARCHAR(40) NOT NULL,
    `target_type` VARCHAR(20) NOT NULL,
    `target_id` VARCHAR(50) NULL,
    `source_text` TEXT NOT NULL,
    `proposed_text` TEXT NOT NULL,
    `questions` TEXT NULL,
    `changes` TEXT NULL,
    `unsupported` TEXT NULL,
    `provider` VARCHAR(30) NOT NULL,
    `model` VARCHAR(80) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `final_text` TEXT NULL,
    `decided_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_suggestions_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_suggestions_user_id_target_type_target_id_idx`(`user_id`, `target_type`, `target_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_learning_profiles` (
    `user_id` INTEGER NOT NULL,
    `data` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_suggestions` ADD CONSTRAINT `ai_suggestions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_learning_profiles` ADD CONSTRAINT `ai_learning_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

