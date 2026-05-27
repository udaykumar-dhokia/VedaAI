import mongoose, { Document, Schema } from "mongoose";

export enum QuestionType {
  MULTIPLE_CHOICE = "Multiple Choice Questions",
  SHORT = "Short Questions",
  DIAGRAM_GRAPH = "Diagram/Graph-Based Questions",
  NUMERICAL = "Numerical Problems",
}

export interface IQuestion {
  questionText: string;
  options?: string[];
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

export interface ISection {
  name: string;
  type: QuestionType;
  questions: IQuestion[];
}

export interface IQuestionTypeConfig {
  type: QuestionType;
  numberQuestions: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  teacher: mongoose.Types.ObjectId;
  title: string;
  subject?: string;
  class?: string;
  school?: string;
  totalMarks?: number;
  timeAllowed?: string;
  dueDate?: Date;
  questionConfigs: IQuestionTypeConfig[];
  additionalInstructions?: string;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: { type: [String] },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  marks: { type: Number, required: true },
});

const sectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(QuestionType),
    required: true,
  },
  questions: [questionSchema],
});

const questionTypeConfigSchema = new Schema<IQuestionTypeConfig>({
  type: {
    type: String,
    enum: Object.values(QuestionType),
    required: true,
  },
  numberQuestions: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },
});

const assignmentSchema = new Schema<IAssignment>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: { type: String, required: true },
    subject: { type: String },
    class: { type: String },
    school: { type: String },
    totalMarks: { type: Number },
    timeAllowed: { type: String },
    dueDate: { type: Date },
    questionConfigs: {
      type: [questionTypeConfigSchema],
      required: true,
    },
    additionalInstructions: { type: String },
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
export default Assignment;
