export enum Domain {
  COMPUTER_SCIENCE_FUNDAMENTALS = 0,
  SOFTWARE_DEVELOPMENT = 1,
  SYSTEMS_AND_NETWORKING = 2,
  CYBERSECURITY = 3,
  DATA_SCIENCE_AND_ANALYTICS = 4,
  DATABASE_ADMINISTRATION = 5,
  QUALITY_ASSURANCE_AND_TESTING = 6,
  PROJECT_MANAGEMENT = 7,
  USER_EXPERIENCE_AND_DESIGN = 8,
  BUSINESS_ANALYSIS = 9,
  ARTIFICIAL_INTELLIGENCE = 10,
  BLOCKCHAIN_AND_CRYPTOCURRENCY = 11,
  NETWORK_ADMINISTRATION = 12,
  CLOUD_COMPUTING = 13,
}

export enum ChallengeStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export const DomainLabels: Record<Domain, string> = {
  [Domain.COMPUTER_SCIENCE_FUNDAMENTALS]: "Computer Science Fundamentals",
  [Domain.SOFTWARE_DEVELOPMENT]: "Software Development",
  [Domain.SYSTEMS_AND_NETWORKING]: "Systems and Networking",
  [Domain.CYBERSECURITY]: "Cybersecurity",
  [Domain.DATA_SCIENCE_AND_ANALYTICS]: "Data Science and Analytics",
  [Domain.DATABASE_ADMINISTRATION]: "Database Administration",
  [Domain.QUALITY_ASSURANCE_AND_TESTING]: "Quality Assurance and Testing",
  [Domain.PROJECT_MANAGEMENT]: "Project Management",
  [Domain.USER_EXPERIENCE_AND_DESIGN]: "User Experience and Design",
  [Domain.BUSINESS_ANALYSIS]: "Business Analysis",
  [Domain.ARTIFICIAL_INTELLIGENCE]: "Artificial Intelligence",
  [Domain.BLOCKCHAIN_AND_CRYPTOCURRENCY]: "Blockchain and Cryptocurrency",
  [Domain.NETWORK_ADMINISTRATION]: "Network Administration",
  [Domain.CLOUD_COMPUTING]: "Cloud Computing",
};

export const ChallengeStatusLabels: Record<ChallengeStatus, string> = {
  [ChallengeStatus.PENDING]: "Pending",
  [ChallengeStatus.APPROVED]: "Approved",
  [ChallengeStatus.REJECTED]: "Rejected",
};
