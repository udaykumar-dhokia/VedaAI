import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Assignment {
  _id: string;
  title: string;
  subject?: string;
  class?: string;
  school?: string;
  totalMarks?: number;
  timeAllowed?: string;
  dueDate?: string;
  sections?: {
    title: string;
    description?: string;
    questions: {
      questionNumber: number;
      difficulty: string;
      questionText: string;
      marks: number;
      options?: string[];
    }[];
  }[];
  answerKey?: {
    questionNumber: number;
    answer: string;
  }[];
  generalInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentState {
  assignments: Assignment[];
  isLoading: boolean;
  searchQuery: string;
}

const initialState: AssignmentState = {
  assignments: [],
  isLoading: true,
  searchQuery: "",
};

const assignmentSlice = createSlice({
  name: "assignment",
  initialState,
  reducers: {
    setAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload;
      state.isLoading = false;
    },
    removeAssignment: (state, action: PayloadAction<string>) => {
      state.assignments = state.assignments.filter((a) => a._id !== action.payload);
    },
    setAssignmentLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setAssignments, removeAssignment, setAssignmentLoading, setSearchQuery } =
  assignmentSlice.actions;
export default assignmentSlice.reducer;
