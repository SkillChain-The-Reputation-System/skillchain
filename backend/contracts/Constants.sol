// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library SystemEnums {
    // --- Domains Constants ---
    enum Domain {
        COMPUTER_SCIENCE_FUNDAMENTALS, // 0
        SOFTWARE_DEVELOPMENT, // 1
        SYSTEMS_AND_NETWORKING, // 2
        CYBERSECURITY, // 3
        DATA_SCIENCE_AND_ANALYTICS, // 4
        DATABASE_ADMINISTRATION, // 5
        QUALITY_ASSURANCE_AND_TESTING, // 6
        PROJECT_MANAGEMENT, // 7
        USER_EXPERIENCE_AND_DESIGN, // 8
        BUSINESS_ANALYSIS, // 9
        ARTIFICIAL_INTELLIGENCE, // 10
        BLOCKCHAIN_AND_CRYPTOCURRENCY, // 11
        NETWORK_ADMINISTRATION, // 12
        CLOUD_COMPUTING // 13
    }

    // --- Challenge Status Constants ---
    enum ChallengeStatus {
        PENDING, // 0
        APPROVED, // 1
        REJECTED // 2
    }

    // --- Challenge Difficulty Level Constants ---
    enum DifficultyLevel {
        EASY, // 0
        MEDIUM, // 1
        HARD // 2
    }

    // --- Challenge Review Answer Constants ---
    enum QualityFactorAnswer {
        NO, // 0
        YES // 1
    }

    // --- Soliution Progress Constants ---
    enum SolutionProgress {
        IN_PROGRESS,
        SUBMITTED,
        UNDER_REVIEW,
        REVIEWED
    }
}

library Weights {
    uint256 constant BASE_WEIGHT = 100; // Base weight for all values

    // --- Challenge Difficulty Level Weights ---
    uint256 constant EASY_CHALLENGE_WEIGHT = 100; // 100% of base weight
    uint256 constant MEDIUM_CHALLENGE_WEIGHT = 120; // 120% of base weight
    uint256 constant HARD_CHALLENGE_WEIGHT = 140; // 140% of base weight

    function getDifficultyWeight(
        SystemEnums.DifficultyLevel level
    ) external pure returns (uint256) {
        if (level == SystemEnums.DifficultyLevel.EASY) {
            return EASY_CHALLENGE_WEIGHT;
        } else if (level == SystemEnums.DifficultyLevel.MEDIUM) {
            return MEDIUM_CHALLENGE_WEIGHT;
        } else if (level == SystemEnums.DifficultyLevel.HARD) {
            return HARD_CHALLENGE_WEIGHT;
        } else {
            revert("Invalid difficulty level");
        }
    }
}

library SystemConsts{  
    // ================= GENERAL =================
    uint256 public constant N_DOMAIN = 14; // Maximum number of domains
    uint256 public constant N_DIFFICULTY_LEVEL = 3; // Maximum number of difficulty levels

    // ================= MODERATION =================
    uint256 public constant REVIEW_QUORUM = 3; // The number of moderators needed to start a finalizing process
    uint256 public constant NUMBER_OF_QUALITY_FACTORS = 7; // The number of quality factors used in the challenge assessment

    // ================= THRESHOLD =================
    uint256 public constant REVIEW_THRESHOLD = 80; // The threshold of quality score for a challenge to be approved
    
    // ================= SCALING CONSTANT =================
    uint256 public constant SCALING_CONSTANT_FOR_SOLVING_PROBLEM = 10; // Scaling constant for solving problem
    uint256 public constant SCALING_CONSTANT_FOR_EVALUATION = 10; // Scaling constant for evaluation
    uint256 public constant SCALING_CONSTANT_FOR_MODERATION = 10; // Scaling constant for moderation
    uint256 public constant SCALING_CONSTANT_FOR_CONTRIBUTION = 10; // Scaling constant for contribution

    // ================= UPDATE REPUTATION THRESHOLD =================
    uint256 public constant THRESHOLD_OF_SOLVING_PROBLEM_SCORE = 50; // Threshold for final solution score
    uint256 public constant THRESHOLD_OF_EVALUATION_DEVIATION = 10; // Threshold for evaluaiton deviation (= Final solution score - Score give by reviewer)
    uint256 public constant THRESHOLD_OF_CHALLENGE_QUALITY_SCORE = 80; // Threshold for challenge quality score
    uint256 public constant THRESHOLD_OF_MODERATION_DEVIATION = 15; // Threshold for moderation deviation (Final challenge quality - Score give by moderator)
}

library MathUtils {
    function mulConst(uint256 a, uint256 b) external pure returns (uint256) {
        return (a * b) / Weights.BASE_WEIGHT;
    }
}
