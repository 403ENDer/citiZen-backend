export enum RoleTypes {
  CITIZEN = "citizen",
  MLASTAFF = "mlastaff",
  DEPT = "dept",
  DEPT_STAFF = "dept_staff",
  ADMIN = "admin",
}

export enum IssueStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export enum PriorityLevel {
  HIGH = "high",
  NORMAL = "normal",
  LOW = "low",
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
