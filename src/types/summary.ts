export interface SummaryInfo {
    platform: string;
    date: string;
    role: string;
    detalization: string;
}

export interface Summary extends SummaryInfo {
    text: string;
}

export interface SummaryWithLoading extends Summary {
    loading: boolean;
}
