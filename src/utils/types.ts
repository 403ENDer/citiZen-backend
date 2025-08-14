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
}

export enum PriorityLevel {
  HIGH = "high",
  NORMAL = "normal",
  LOW = "low",
}

export enum Satisfaction {
  GOOD = "good",
  AVERAGE = "average",
  POOR = "poor",
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
