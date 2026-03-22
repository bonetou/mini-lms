export type ConsultationStatus =
  | "SCHEDULED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "COMPLETED";

export type UserProfile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CurrentUser = {
  user: {
    id: string;
    email: string | null;
  };
  profile: UserProfile | null;
  roles: string[];
  isAdmin: boolean;
};

export type ConsultationSummary = {
  id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  reason: string;
  scheduledAt: string;
  status: ConsultationStatus;
  isCompleted: boolean;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConsultationHistoryEntry = {
  id: string;
  consultationId: string;
  changedByUserId: string;
  fromStatus: ConsultationStatus | null;
  toStatus: ConsultationStatus;
  notes: string | null;
  createdAt: string;
};

export type ConsultationDetail = ConsultationSummary & {
  studentProfile: UserProfile | null;
  statusHistory: ConsultationHistoryEntry[];
};

export type ConsultationListResponse = {
  items: ConsultationSummary[];
  total: number;
  page: number;
  pageSize: number;
  scope: "own" | "all";
};

export type AdminConsultationListResponse = {
  items: ConsultationSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type ConsultationFilters = {
  status: "" | ConsultationStatus;
  scheduledFrom: string;
  scheduledTo: string;
  page: number;
  pageSize: number;
};

export type AdminConsultationFilters = ConsultationFilters & {
  studentId: string;
};

export type TablePreferences = {
  pageSize: number;
  visibleColumns: string[];
};
