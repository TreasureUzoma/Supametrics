import { ReactNode } from "react";

// eslint-disable-next-line
export type Response<T = any> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: string;
  pagination?: {
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export interface Team {
  uuid: string;
  name: string;
  logo: {
    src: string;
    alt: string;
  };
  subscriptionType: "free" | "pro" | "enterprise";
  isPersonal: boolean; // true if it's the user's personal workspace
}

export interface Project {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  type: "web" | "mobile" | "backend";
  url: string;
  userId: string | null;
  teamId: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "archived" | "deleted";
  visitors: number;
}

export interface Team {
  uuid: string;
  name: string;
  logo: {
    src: string;
    alt: string;
  };
  subscriptionType: "free" | "pro" | "enterprise";
  isPersonal: boolean;
}
export interface User {
  uuid: string;
  email: string;
  name: string;
  avatar: string;
  subscriptionType: "free" | "pro" | "enterprise";
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  teams: TeamMembership[]; // <-- fix
}

export interface TeamMembership {
  team: RawTeam; // raw backend team object
  role: "owner" | "member";
}

export interface RawTeam {
  uuid: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface Team {
  uuid: string;
  name: string;
  logo: {
    src: string;
    alt: string;
  };
  subscriptionType: "free" | "pro" | "enterprise";
  isPersonal: boolean;
  role: "owner" | "member";
}

export type Timerange =
  | "10secs"
  | "5mins"
  | "today"
  | "yesterday"
  | "thisweek"
  | "thismonth"
  | "thisyear"
  | "last3years";

export type AnalyticsSummaryItem = {
  [key: string]: number | string;
};

export interface Analytics {
  name: string;
  url: string;
  projectId: number;
  filter: string;
  onlineVisitors: number;
  osSummary: AnalyticsSummaryItem[];
  deviceSummary: AnalyticsSummaryItem[];
  browserSummary: AnalyticsSummaryItem[];
  topPaths: AnalyticsSummaryItem[];
  topReferrers: AnalyticsSummaryItem[];
  topHostnames: AnalyticsSummaryItem[];
  topUtmSources: AnalyticsSummaryItem[];
  totalVisits: number;
  uniqueVisitors: number;
  totalVisitsChange: string | null;
  uniqueVisitorsChange: string | null;
  frequency: Array<{
    time: string;
    totalVisits: number;
    uniqueVisitors: number;
  }>;
}

export interface StatCardProps {
  title: string;
  value: number;
  change?: number | null;
  loading: boolean;
}

export interface MetricsGridProps {
  children: ReactNode;
}
