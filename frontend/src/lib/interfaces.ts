
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

export enum ChallengeStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
}

export interface ChallengeInterface {
    contributor: string | undefined;
    title: string | undefined;
    description: string | undefined;
    category: string | undefined;
    date: string | undefined;
    status: string | undefined;
}