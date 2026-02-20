import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TimeEntry {
    startTime: Time;
    duration?: bigint;
    endTime?: Time;
    user: Principal;
}
export interface TaskTemplate {
    id: string;
    title: string;
    description: string;
    customFields: Array<CustomField>;
    priority: TaskPriority;
}
export type Time = bigint;
export interface Comment {
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface RecurringTask {
    frequency: RecurrenceFrequency;
    nextOccurrence: Time;
}
export interface Task {
    id: string;
    status: TaskStatus;
    title: string;
    submissionTimestamp?: Time;
    recurring?: RecurringTask;
    dueDate: Time;
    description: string;
    customFields: Array<CustomField>;
    progress: bigint;
    reminderDate: Time;
    projectId: string;
    dependencies: Array<string>;
    priority: TaskPriority;
    comments: Array<Comment>;
    attachments: Array<ExternalBlob>;
    timeEntries: Array<TimeEntry>;
    assignedEmployee: Principal;
}
export interface Report {
    completionRate: bigint;
    onTimeDeliveryPercentage: bigint;
    productivityTrends: Array<ProductivityTrend>;
    averageTaskDuration: bigint;
}
export interface ProductivityTrend {
    period: string;
    tasksCompleted: bigint;
    averageCompletionTime: bigint;
}
export type RecurrenceFrequency = {
    __kind__: "monthly";
    monthly: bigint;
} | {
    __kind__: "daily";
    daily: bigint;
} | {
    __kind__: "weekly";
    weekly: bigint;
};
export interface CustomField {
    value: string;
    name: string;
}
export interface Project {
    id: string;
    creator: Principal;
    name: string;
    description: string;
}
export interface UserProfile {
    roleType: RoleType;
    name: string;
    role: string;
}
export enum RoleType {
    admin = "admin",
    teacher = "teacher"
}
export enum TaskPriority {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTaskAttachment(taskId: string, attachment: ExternalBlob): Promise<void>;
    addTaskComment(taskId: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(id: string, name: string, description: string): Promise<void>;
    createTask(id: string, title: string, description: string, assignedEmployee: Principal, dueDate: Time, projectId: string, reminderDate: Time, priority: TaskPriority, dependencies: Array<string>, recurring: RecurringTask | null, customFields: Array<CustomField>): Promise<void>;
    createTaskTemplate(id: string, title: string, description: string, priority: TaskPriority, customFields: Array<CustomField>): Promise<void>;
    getAllProjects(): Promise<Array<Project>>;
    getAllTaskTemplates(): Promise<Array<TaskTemplate>>;
    getAllTasks(): Promise<Array<Task>>;
    getAssignedTasks(): Promise<Array<Task>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProjectReport(): Promise<Report>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserRoleType(user: Principal, roleType: RoleType): Promise<void>;
    startTaskTimer(taskId: string): Promise<void>;
    stopTaskTimer(taskId: string): Promise<void>;
    submitWorkForTask(taskId: string): Promise<void>;
    updateTaskProgress(taskId: string, progress: bigint): Promise<void>;
}
