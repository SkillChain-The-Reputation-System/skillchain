
export interface IrysUploadResponseInterface {
    success: boolean;
    id: string | undefined;
    url: string | undefined;
}

export interface FetchUserDataOnChainOutput {
    username: string | undefined;
    avatar_url: string | undefined;
    bio_url: string | undefined;
}

export enum ChallengeCategory {
    algorithms = "0",
    software_development = "1",
    system_design = "2",
    cybersecurity = "3",
    data_engineering = "4",
    devops = "5",
    soft_skills = "6"
}

export const ChallengeCategoryLabels: Record<ChallengeCategory, string> = {
    [ChallengeCategory.algorithms]: "Algorithms",
    [ChallengeCategory.software_development]: "Software Development",
    [ChallengeCategory.system_design]: "System Design",
    [ChallengeCategory.cybersecurity]: "Cybersecurity",
    [ChallengeCategory.data_engineering]: "Data Engineering",
    [ChallengeCategory.devops]: "DevOps",
    [ChallengeCategory.soft_skills]: "Soft Skills",
}

export enum ChallengeStatus {
    pending = "Pending",
    approved = "Approved",
    rejected = "Rejected",
}

export interface ChallengeInterface {
    contributor: string | undefined;
    title: string | undefined;
    description: string | undefined;
    category: string | ChallengeCategory;
    date: string | Date;
    status: string | ChallengeStatus;
}