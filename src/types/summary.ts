export interface SummaryInfo {
    id: string;
    platform: string;
    date: string;
    role: string;
    detalization: string;
}

export interface Summary extends SummaryInfo {
    text: string;
}

export interface SummaryWithState extends Summary {
    isActive: boolean;
}

export interface SummaryInfoData {
    sumId: string;
    role?: string;
}
