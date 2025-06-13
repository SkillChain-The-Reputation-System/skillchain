// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library SystemEnums {
    // --- Domains Constants ---
    enum Domain {
        COMPUTER_SCIENCE_FUNDAMENTALS, // 0 - Core CS concepts: algorithms, data structures, complexity theory
        SOFTWARE_DEVELOPMENT, // 1 - Programming languages, frameworks, development methodologies
        SYSTEMS_AND_NETWORKING, // 2 - Operating systems, network protocols, system architecture
        CYBERSECURITY, // 3 - Information security, ethical hacking, security protocols
        DATA_SCIENCE_AND_ANALYTICS, // 4 - Data analysis, machine learning, statistical modeling
        DATABASE_ADMINISTRATION, // 5 - Database design, SQL, data management systems
        QUALITY_ASSURANCE_AND_TESTING, // 6 - Software testing, test automation, quality control
        PROJECT_MANAGEMENT, // 7 - Agile methodologies, project planning, team coordination
        USER_EXPERIENCE_AND_DESIGN, // 8 - UI/UX design, user research, design principles
        BUSINESS_ANALYSIS, // 9 - Requirements analysis, business process modeling
        ARTIFICIAL_INTELLIGENCE, // 10 - AI algorithms, neural networks, deep learning
        BLOCKCHAIN_AND_CRYPTOCURRENCY, // 11 - Blockchain technology, smart contracts, DeFi
        NETWORK_ADMINISTRATION, // 12 - Network configuration, infrastructure management
        CLOUD_COMPUTING // 13 - Cloud platforms, distributed systems, containerization
    }

    // --- Challenge Status Constants ---
    enum ChallengeStatus {
        DRAFT, // 0 - Challenge in progress
        PENDING, // 1 - Challenge submitted and awaiting reviews
        APPROVED, // 2 - Challenge has been reviewed and approved
        REJECTED // 3 - Challenge has been reviewed and rejected due to quality issues
    }

    // --- Challenge Difficulty Level Constants ---
    enum DifficultyLevel {
        EASY, // 0 - Beginner level challenge, basic concepts and simple implementation
        MEDIUM, // 1 - Intermediate level challenge, moderate complexity and problem-solving
        HARD // 2 - Advanced level challenge, complex algorithms and deep understanding required
    }

    // --- Challenge Review Answer Constants ---
    enum QualityFactorAnswer {
        NO, // 0 - Quality factor criterion is not met
        YES // 1 - Quality factor criterion is satisfied
    }

    // --- Solution Progress Constants ---
    enum SolutionProgress {
        IN_PROGRESS, // 0 - Solution is being worked on by the participant
        SUBMITTED, // 1 - Solution has been submitted and awaiting evaluation
        UNDER_REVIEW, // 2 - Solution is currently being reviewed by evaluators
        REVIEWED // 3 - Solution has been evaluated and feedback provided
    }

    // --- Job Status Constants ---
    enum JobStatus {
        DRAFT, // 0 - Job posting is being created but not yet published
        OPEN, // 1 - Job is actively accepting applications
        PAUSED, // 2 - Job applications are temporarily suspended
        CLOSED, // 3 - Job is no longer accepting new applications
        FILLED, // 4 - Position has been filled
        ARCHIVED // 5 - Job posting has been archived for record keeping
    }

    // --- Job Application Status Constants ---
    enum ApplicationStatus {
        PENDING, // 0 - Initial state when application is submitted
        REVIEWING, // 1 - Application is being reviewed
        SHORTLISTED, // 2 - Candidate is shortlisted, they will join some interview sessions (if the recruiter wants)
        INTERVIEWED, // 3 - Candidate is interviewed, waiting for final decision
        REJECTED, // 4 - Application was rejected
        WITHDRAWN, // 5 - Applicant withdrew their application
        HIRED // 6 - Applicant was hired for the position
    }

    // --- Meeting Status Constants ---
    enum MeetingStatus {
        PENDING, // 0 - Meeting is scheduled but has not yet occurred
        COMPLETED, // 1 - Meeting has been successfully conducted
        CANCELLED // 2 - Meeting has been cancelled and will not take place
    }
}

library Weights {
    uint256 constant BASE_WEIGHT = 100; // Base weight for all values

    // --- Challenge Difficulty Level Weights ---
    uint256 constant EASY_CHALLENGE_WEIGHT = 1e18; // 100% of base weight
    uint256 constant MEDIUM_CHALLENGE_WEIGHT = 1.2e18; // 120% of base weight
    uint256 constant HARD_CHALLENGE_WEIGHT = 1.4e18; // 140% of base weight

    // --- Challenge Difficulty Level Weights for Cost Calculation ---
    uint256 constant EASY_COST_WEIGHT = 1e18;
    uint256 constant MEDIUM_COST_WEIGHT = 1.5e18;
    uint256 constant HARD_COST_WEIGHT = 2e18;

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

    function getDifficultyCostWeight(
        SystemEnums.DifficultyLevel level
    ) external pure returns (uint256) {
        if (level == SystemEnums.DifficultyLevel.EASY) {
            return EASY_COST_WEIGHT;
        } else if (level == SystemEnums.DifficultyLevel.MEDIUM) {
            return MEDIUM_COST_WEIGHT;
        } else if (level == SystemEnums.DifficultyLevel.HARD) {
            return HARD_COST_WEIGHT;
        } else {
            revert("Invalid difficulty level");
        }
    }
}

library SystemConsts {
    // ================= GENERAL =================
    uint256 public constant N_DOMAIN = 14; // Maximum number of domains
    uint256 public constant N_DIFFICULTY_LEVEL = 3; // Maximum number of difficulty levels

    // ================= SCORING CONSTANT =================
    uint256 public constant REPUTATION_WEIGHT_FOR_SCORING = 1; // Weight for reputation score

    // ================= MODERATION =================
    uint256 public constant REVIEW_QUORUM = 3; // The number of moderators needed to start a finalizing process
    uint256 public constant NUMBER_OF_QUALITY_FACTORS = 7; // The number of quality factors used in the challenge assessment

    // ================= EVALUATION =================
    uint256 public constant EVALUATION_QUORUM = 3;

    // ================= CHALLENGE FEE =================
    uint256 public constant CHALLENGE_FEE_MIN = 1e18; // Minimum challenge fee in native token
    uint256 public constant CHALLENGE_FEE_MAX = 5e18; // Maximum challenge fee in native token
    uint256 public constant CHALLENGE_FEE_ALPHA = 0.6e18; // influence of difficulty
    uint256 public constant CHALLENGE_FEE_BETA = 0.8e18; // influence of quality
    uint256 public constant CHALLENGE_FEE_GAMMA = 0.3e18; // percentage of bounty
    uint256 public constant EXPECTED_PARTICIPANTS = 30; // Expected number of participants in a challenge

    // ================= THRESHOLD =================
    uint256 public constant REVIEW_THRESHOLD = 80; // The threshold of quality score for a challenge to be approved

    // ================= SCALING CONSTANT =================
    uint256 public constant SCALING_CONSTANT_FOR_SOLVING_PROBLEM = 1e18; // Scaling constant for solving problem
    uint256 public constant SCALING_CONSTANT_FOR_EVALUATION = 1e18; // Scaling constant for evaluation
    uint256 public constant SCALING_CONSTANT_FOR_MODERATION = 1e18; // Scaling constant for moderation
    uint256 public constant SCALING_CONSTANT_FOR_CONTRIBUTION = 1e18; // Scaling constant for contribution

    // ================= MAX REPUTATION REWARD & PENALTY =================
    uint256 public constant MAX_REWARD_REPUTATION_SCORE_FOR_SOLVING_PROBLEM = 10; // Maximum reward of reputation score for solving a problem
    uint256 public constant MAX_PENALTY_REPUTATION_SCORE_FOR_SOLVING_PROBLEM = 10; // Maximum penalty of reputation score for solving a problem
    uint256 public constant MAX_REWARD_REPUTATION_SCORE_FOR_EVALUATION = 10; // Maximum reward of reputation score for evaluating a solution
    uint256 public constant MAX_PENALTY_REPUTATION_SCORE_FOR_EVALUATION = 10; // Maximum penalty of reputation score for evaluating a solution
    uint256 public constant MAX_REWARD_REPUTATION_SCORE_FOR_MODERATION = 10; // Maximum reward of reputation score for assessing a challenge
    uint256 public constant MAX_PENALTY_REPUTATION_SCORE_FOR_MODERATION = 10; // Maximum penalty of reputation score for assessing a challenge
    uint256 public constant MAX_REWARD_REPUTATION_SCORE_FOR_CONTRIBUTION = 10; // Maximum reward of reputation score for contributing a challenge
    uint256 public constant MAX_PENALTY_REPUTATION_SCORE_FOR_CONTRIBUTION = 10; // Maximum penalty of reputation score for contributing a challenge

    // ================= UPDATE REPUTATION THRESHOLD =================
    uint256 public constant THRESHOLD_OF_SOLVING_PROBLEM_SCORE = 30; // Threshold for final solution score
    uint256 public constant THRESHOLD_OF_EVALUATION_DEVIATION = 60; // Threshold for evaluation deviation (= Final solution score - Score give by reviewer)
    uint256 public constant THRESHOLD_OF_CHALLENGE_QUALITY_SCORE = 80; // Threshold for challenge quality score
    uint256 public constant THRESHOLD_OF_MODERATION_DEVIATION = 60; // Threshold for moderation deviation (Final challenge quality - Score give by moderator)

    // ================= MODERATION REWARD AND PENALTY =================
    uint256 public constant MODERATION_REWARD_DEVIATION_THRESHOLD = 70;
    uint256 public constant MODERATION_MAX_DEVIATION = 100; // The max score of a challenge can have
    uint256 public constant MODERATION_STAKE_PENALTY_RATE = 0.3e18; // gamma - maximum of 30% the stake will be penalized
    uint256 public constant MODERATION_REPUTATION_INFLUENCE_COEFFICIENT = 0.4e18; // beta - influence of moderator reputation when distributing reward
    uint256 public constant MODERATION_REWARD_DISTRIBUTION_SPREAD = 0.8e18; // alpha

    // ================= RECRUITMENT FEE =================
    // Base platform fee for each hiring action (4 POL scaled to 1e18)
    uint256 public constant RECRUITMENT_BASE_FEE = 4e18;
    // Coefficient controlling the impact of candidate reputation
    uint256 public constant RECRUITMENT_REPUTATION_COEFFICIENT = 0.2e18;

    // ================= RECRUITMENT BUDGET =================
    uint256 public constant RECRUITMENT_BUDGET_MIN = 10e18; // Minimum budget to be considered a recruiter
}