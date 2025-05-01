import { Domain, ChallengeStatus } from "@/constants/system";

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

export interface ChallengeInterface {
    id: string | undefined;
    contributor: string | undefined;
    title: string | undefined;
    description: string | undefined;
    category: string | Domain;
    contributeAt: number;
    status: string | ChallengeStatus;
}

export interface GetCurrentTimeResponse {
    success: boolean;
    time: number;
}