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
