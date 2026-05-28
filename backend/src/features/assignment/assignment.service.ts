import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import Assignment, { IAssignment, QuestionType } from "./assignment.model";
import "dotenv/config";
import { getLlm } from "../../config/llm.config";

const questionOutputSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number(),
});

const sectionOutputSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(QuestionType),
  questions: z.array(questionOutputSchema),
});

const assignmentOutputSchema = z.object({
  title: z.string(),
  sections: z.array(sectionOutputSchema),
});

type AssignmentOutput = z.infer<typeof assignmentOutputSchema>;

/**
 * Service responsible for generating and retrieving teacher assignments.
 */
export class AssignmentService {
  /**
   * Generate a new assignment from teacher-provided parameters.
   *
   * Creates a structured prompt for the Ollama model, validates the JSON
   * output, then saves the generated assignment document.
   *
   * @param {Object} params - Assignment generation parameters.
   * @param {string} params.teacherId - ID of the teacher creating the assignment.
   * @param {string} params.title - Assignment title or subject.
   * @param {string} [params.dueDate] - Optional due date string.
   * @param {Array} params.questionConfigs - Section configurations for question generation.
   * @param {string} [params.additionalInstructions] - Optional extra instructions.
   * @param {string} [params.referenceText] - Optional reference material for question context.
   * @returns {Promise<IAssignment>} Persisted assignment document.
   */
  async generateAssignment(params: {
    teacherId: string;
    title: string;
    subject?: string;
    studentClass?: string;
    school?: string;
    dueDate?: string;
    questionConfigs: {
      type: QuestionType;
      numberQuestions: number;
      marksPerQuestion: number;
    }[];
    additionalInstructions?: string;
    referenceText?: string;
    llmApiKey?: string;
    llmModelName?: string;
  }): Promise<IAssignment> {
    const configDescriptions = params.questionConfigs
      .map(
        (c) =>
          `- Section corresponding to "${c.type}": Generate exactly ${c.numberQuestions} questions, assigning ${c.marksPerQuestion} mark(s) to each question.`
      )
      .join("\n");

    const totalQuestions = params.questionConfigs.reduce((acc, c) => acc + c.numberQuestions, 0);

    const systemPrompt = `You are VedaAI, an advanced educational AI. Your task is to generate a highly structured academic assignment or test based on the parameters provided.

You must partition the assignment into distinct sections (e.g. "Section A", "Section B"). Each section should correspond to one of the specified question types.
The total number of questions across all sections MUST be exactly ${totalQuestions}.

Section Configurations:
${configDescriptions}

Ensure questions are generated with an appropriate balance of difficulty (easy, medium, hard).

Assignment Parameters:
- Subject/Title: ${params.title}
${params.additionalInstructions ? `- Additional Instructions: ${params.additionalInstructions}` : ""}
${params.referenceText ? `- Reference Material to base questions on: \n${params.referenceText}` : ""}

You must respond strictly with JSON conforming to this schema:
{
  "title": "Assignment Title",
  "sections": [
    {
      "name": "Section A",
      "type": "Multiple Choice Questions",
      "questions": [
        {
          "questionText": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "difficulty": "easy",
          "marks": 5
        }
      ]
    }
  ]
}

Only return the raw JSON object. Do not include any other conversational text or surrounding text.`;

    let generatedTitle = params.title;
    let generatedSections: any[] = [];

    try {
      const llm = getLlm(params.llmApiKey, params.llmModelName);
      const structuredLlm = llm.withStructuredOutput(assignmentOutputSchema);
      const result = (await structuredLlm.invoke(systemPrompt)) as AssignmentOutput;
      generatedSections = result.sections;
      generatedTitle = result.title || params.title;
    } catch (e) {
      const llm = getLlm(params.llmApiKey, params.llmModelName);
      const fallbackPrompt = `${systemPrompt}\n\nYour response must be a single, valid JSON block. Wrap it in a JSON markdown block if necessary, but return only JSON.`;
      const response = await llm.invoke(fallbackPrompt);
      const text =
        typeof response.content === "string" ? response.content : JSON.stringify(response.content);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to generate a valid JSON assignment.");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      generatedSections = parsed.sections;
      generatedTitle = parsed.title || params.title;
    }

    const totalMarks = generatedSections.reduce(
      (acc, sec) =>
        acc + sec.questions.reduce((qAcc: number, q: { marks: number }) => qAcc + q.marks, 0),
      0
    );

    const assignment = new Assignment({
      teacher: params.teacherId,
      title: generatedTitle,
      subject: params.subject,
      class: params.studentClass,
      school: params.school,
      totalMarks,
      dueDate: params.dueDate ? new Date(params.dueDate) : undefined,
      questionConfigs: params.questionConfigs,
      additionalInstructions: params.additionalInstructions,
      sections: generatedSections,
    });

    await assignment.save();
    return assignment;
  }

  /**
   * Regenerate an assignment based on teacher feedback.
   *
   * Finds the assignment owned by the teacher, applies the provided feedback,
   * and requests a new structured assignment from the LLM while preserving
   * the original question count and assignment structure.
   *
   * @param {Object} params - Regeneration parameters.
   * @param {string} params.assignmentId - ID of the assignment to regenerate.
   * @param {string} params.teacherId - ID of the teacher requesting regeneration.
   * @param {Array} params.feedbacks - Feedback items for specific questions.
   * @param {number} params.feedbacks[].sectionIndex - Index of the section with feedback.
   * @param {number} params.feedbacks[].questionIndex - Index of the question with feedback.
   * @param {string} params.feedbacks[].comment - The feedback comment to apply.
   * @returns {Promise<IAssignment>} Updated assignment document.
   */
  async regenerateAssignment(params: {
    assignmentId: string;
    teacherId: string;
    feedbacks: {
      sectionIndex: number;
      questionIndex: number;
      comment: string;
    }[];
    llmApiKey?: string;
    llmModelName?: string;
  }): Promise<IAssignment> {
    const assignment = await Assignment.findOne({
      _id: params.assignmentId,
      teacher: params.teacherId,
    });
    if (!assignment) {
      throw new Error("Assignment not found or unauthorized.");
    }

    const currentSectionsStr = JSON.stringify(assignment.sections, null, 2);

    let feedbackStr = "Feedback on specific questions:\n";
    params.feedbacks.forEach((f) => {
      feedbackStr += `- Section index ${f.sectionIndex}, Question index ${f.questionIndex}: ${f.comment}\n`;
    });

    const totalQuestions = assignment.questionConfigs.reduce(
      (acc, c) => acc + c.numberQuestions,
      0
    );

    const systemPrompt = `You are VedaAI, an advanced educational AI. Your task is to modify and regenerate a highly structured academic assignment based on the teacher's feedback.

You are provided with the current sections and questions of the assignment, and a list of specific feedback comments indicating what needs to be changed.
Apply the requested changes to the specific questions mentioned in the feedback, and preserve the rest of the assignment as much as possible.
The total number of questions across all sections MUST be exactly ${totalQuestions}.

Current Assignment Sections JSON:
${currentSectionsStr}

Teacher's Feedback:
${feedbackStr}

You must respond strictly with JSON conforming to this schema:
{
  "title": "Assignment Title",
  "sections": [
    {
      "name": "Section A",
      "type": "Multiple Choice Questions",
      "questions": [
        {
          "questionText": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "difficulty": "easy",
          "marks": 5
        }
      ]
    }
  ]
}

Only return the raw JSON object. Do not include any other conversational text or surrounding text.`;

    let generatedSections: any[] = [];
    let generatedTitle = assignment.title;

    try {
      const llm = getLlm(params.llmApiKey, params.llmModelName);
      const structuredLlm = llm.withStructuredOutput(assignmentOutputSchema);
      const result = (await structuredLlm.invoke(systemPrompt)) as AssignmentOutput;
      generatedSections = result.sections;
      generatedTitle = result.title || assignment.title;
    } catch (e) {
      const llm = getLlm(params.llmApiKey, params.llmModelName);
      const fallbackPrompt = `${systemPrompt}\n\nYour response must be a single, valid JSON block. Wrap it in a JSON markdown block if necessary, but return only JSON.`;
      const response = await llm.invoke(fallbackPrompt);
      const text =
        typeof response.content === "string" ? response.content : JSON.stringify(response.content);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to regenerate a valid JSON assignment.");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      generatedSections = parsed.sections;
      generatedTitle = parsed.title || assignment.title;
    }

    const totalMarks = generatedSections.reduce(
      (acc, sec) =>
        acc + sec.questions.reduce((qAcc: number, q: { marks: number }) => qAcc + q.marks, 0),
      0
    );

    assignment.title = generatedTitle;
    assignment.sections = generatedSections;
    assignment.totalMarks = totalMarks;

    await assignment.save();
    return assignment;
  }

  /**
   * Retrieve assignments for a specific teacher.
   *
   * Returns assignments authored by the given teacher, sorted by newest first.
   *
   * @param {string} teacherId - Teacher user ID.
   * @returns {Promise<IAssignment[]>} Array of assignment documents.
   */
  async getAssignmentsByTeacher(teacherId: string): Promise<IAssignment[]> {
    return Assignment.find({ teacher: teacherId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieve a single assignment by ID, scoped to the specified teacher.
   *
   * @param {string} id - Assignment document ID.
   * @param {string} teacherId - Teacher user ID to enforce ownership.
   * @returns {Promise<IAssignment | null>} Assignment document or null if not found.
   */
  async getAssignmentById(id: string, teacherId: string): Promise<IAssignment | null> {
    return Assignment.findOne({ _id: id, teacher: teacherId });
  }

  /**
   * Delete an assignment document owned by the specified teacher.
   *
   * @param {string} id - Assignment document ID.
   * @param {string} teacherId - Teacher user ID to enforce ownership.
   * @returns {Promise<IAssignment | null>} Deleted assignment document or null if not found.
   */
  async deleteAssignment(id: string, teacherId: string): Promise<IAssignment | null> {
    return Assignment.findOneAndDelete({ _id: id, teacher: teacherId });
  }
}
