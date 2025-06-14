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
export interface CourseResult {
  id: number;
  userId: string;
  courseId: number;
  groupId: number;
  status: string;
  testId: number;
  startTime: string;
  endTime: string;
  score: number;
  updatedAt: Date;
  count: number;
}

export interface ApiResponseCourseResults {
  results: CourseResult[];
  message: string;
}
