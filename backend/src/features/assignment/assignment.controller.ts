import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { AssignmentService } from "./assignment.service";

const assignmentService = new AssignmentService();

const AssignmentController = {
  /**
   * Generate a new assignment for the authenticated teacher.
   *
   * Validates required request payload fields, then uses the assignment
   * service to create and return the new assignment record.
   *
   * @param {AuthenticatedRequest} req - Request object containing auth user and body.
   * @param {Response} res - Express response object for sending JSON payload.
   * @returns {Promise<Response>} Created assignment response or an error status.
   */
  generateAssignment: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
      }

      const { title, dueDate, questionConfigs, additionalInstructions, referenceText } = req.body;

      if (
        !title ||
        !questionConfigs ||
        !Array.isArray(questionConfigs) ||
        questionConfigs.length === 0
      ) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Required parameters are missing." });
      }

      const assignment = await assignmentService.generateAssignment({
        teacherId: user._id.toString(),
        title,
        dueDate,
        questionConfigs,
        additionalInstructions,
        referenceText,
      });

      return res.status(StatusCodes.CREATED).json(assignment);
    } catch (e: any) {
      console.error(e);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },

  /**
   * Retrieve all assignments created by the authenticated teacher.
   *
   * Returns a list of assignments owned by the current teacher user.
   *
   * @param {AuthenticatedRequest} req - Request object with authenticated user.
   * @param {Response} res - Response object used to send the assignments.
   * @returns {Promise<Response>} List of assignments or an error status.
   */
  getAssignments: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
      }

      const assignments = await assignmentService.getAssignmentsByTeacher(user._id.toString());

      return res.status(StatusCodes.OK).json(assignments);
    } catch (e) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },

  /**
   * Retrieve a specific assignment by its ID for the authenticated teacher.
   *
   * Validates the authenticated teacher, fetches the assignment, and returns
   * 404 if the assignment does not belong to the teacher or is missing.
   *
   * @param {AuthenticatedRequest} req - Request object containing auth user and params.
   * @param {Response} res - Response object used to send assignment data.
   * @returns {Promise<Response>} Assignment response or an error status.
   */
  getAssignmentById: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
      }

      const { id } = req.params;
      const assignment = await assignmentService.getAssignmentById(
        id.toString(),
        user._id.toString()
      );

      if (!assignment) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Assignment not found." });
      }

      return res.status(StatusCodes.OK).json(assignment);
    } catch (e) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },
};

export default AssignmentController;
