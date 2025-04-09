// types.ts - Type definitions
export interface Group {
  id: number;
  name: string;
  createdAt: string;
  role: string;
  ownerId: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  clerk_id: string;
  role: string;
}

export interface Course {
  id: number;
  name: string;
}

export interface ApiResponse {
  groups: Group[];
}

export interface ApiResponseUsers {
  users: User[];
}

export interface ErrorResponse {
  message: string;
}

export interface ApiResponseCourses {
  boughtCourses: Course[];
  assignedCourses: Course[];
  message: string;
}
