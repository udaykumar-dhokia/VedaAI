import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

const AdminController = {
  /**
   * Return the currently authenticated admin user.
   *
   * If the request has a valid authenticated user attached by middleware,
   * this endpoint responds with that user object. Otherwise it returns
   * 401 Unauthorized.
   *
   * @param {AuthenticatedRequest} req - Request object with optional auth user.
   * @param {Response} res - Response object used to send HTTP results.
   * @returns {Promise<Response>} Response containing the admin user or an error.
   */
  getAdmin: async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
      }

      return res.status(StatusCodes.OK).json({ user });
    } catch (e) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },
};

export default AdminController;
