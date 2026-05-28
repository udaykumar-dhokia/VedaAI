import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { AssignmentService } from "./assignment.service";
import jobs from "../../config/queue.config";

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

      const {
        title,
        subject,
        class: studentClass,
        dueDate,
        questionConfigs,
        additionalInstructions,
        referenceText,
      } = req.body;

      if (
        !title ||
        !subject ||
        !studentClass ||
        !questionConfigs ||
        !Array.isArray(questionConfigs) ||
        questionConfigs.length === 0
      ) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Required parameters are missing." });
      }

      const job = await jobs.add("generate-assignment", {
        teacherId: user._id.toString(),
        school: user.school,
        title,
        subject,
        studentClass,
        dueDate,
        questionConfigs,
        additionalInstructions,
        referenceText,
      });

      return res
        .status(StatusCodes.ACCEPTED)
        .json({ jobId: job.id, message: "Assignment generation started." });
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

  /**
   * Delete an assignment by ID for the authenticated teacher.
   *
   * Ensures only the owner teacher can remove the assignment, then returns
   * a success message when deletion completes.
   *
   * @param {AuthenticatedRequest} req - Request object containing auth user and params.
   * @param {Response} res - Response object used to send deletion result.
   * @returns {Promise<Response>} HTTP response indicating success or failure.
   */
  deleteAssignment: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
      }

      const { id } = req.params;
      const assignment = await assignmentService.deleteAssignment(
        id.toString(),
        user._id.toString()
      );

      if (!assignment) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Assignment not found." });
      }

      return res.status(StatusCodes.OK).json({ message: "Assignment deleted successfully." });
    } catch (e) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },

  /**
   * Get the execution status of a queued assignment job.
   *
   * Looks up a BullMQ job by ID and returns its state, plus the result or
   * failure reason when available.
   *
   * @param {AuthenticatedRequest} req - Request object containing params.
   * @param {Response} res - Response object used to return job status.
   * @returns {Promise<Response>} Job status payload or error response.
   */
  getAssignmentStatus: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { jobId } = req.params;
      const job = await jobs.getJob(jobId as string);

      if (!job) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Job not found." });
      }

      const state = await job.getState();

      if (state === "completed") {
        return res.status(StatusCodes.OK).json({ status: state, assignmentId: job.returnvalue });
      } else if (state === "failed") {
        return res.status(StatusCodes.OK).json({ status: state, error: job.failedReason });
      } else {
        return res.status(StatusCodes.OK).json({ status: state });
      }
    } catch (e) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },

  /**
   * Queue an assignment regeneration job using teacher feedback.
   *
   * Validates the provided feedback array and enqueues a regeneration job
   * that will refresh the assignment with the supplied instructor input.
   *
   * @param {AuthenticatedRequest} req - Request object containing auth user and body.
   * @param {Response} res - Response object used to return queue result.
   * @returns {Promise<Response>} Accepted response with the queued job ID.
   */
  regenerateAssignment: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
      }

      const { id } = req.params;
      const { feedbacks } = req.body;

      if (!feedbacks || !Array.isArray(feedbacks)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Feedbacks array is required." });
      }

      const job = await jobs.add("regenerate-assignment", {
        assignmentId: id,
        teacherId: user._id.toString(),
        feedbacks,
      });

      return res
        .status(StatusCodes.ACCEPTED)
        .json({ jobId: job.id, message: "Assignment regeneration started." });
    } catch (e: any) {
      console.error(e);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: e.message || ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },
};

export default AssignmentController;
