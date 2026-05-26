import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../features/admin/admin.model";

/**
 * JWT payload expected from the authentication token.
 *
 * @property {string} id - MongoDB ID of the authenticated admin user.
 * @property {string} email - Email address of the authenticated admin user.
 */
interface DecodedToken {
  id: string;
  email: string;
}

/**
 * Express request object extended with authenticated user details.
 *
 * @property {IAdmin} [user] - Admin user object attached after successful auth.
 */
export interface AuthenticatedRequest extends Request {
  user?: IAdmin;
}

/**
 * Express middleware that validates the JWT token and attaches the admin user.
 *
 * Checks for a token in cookies or the Authorization header, verifies it,
 * loads the corresponding admin from the database, and assigns it to req.user.
 * If validation fails, the middleware returns 401 Unauthorized.
 *
 * @param {AuthenticatedRequest} req - Incoming request with optional user attachment.
 * @param {Response} res - Response object used to send errors.
 * @param {NextFunction} next - Next middleware callback invoked on success.
 * @returns {Promise<Response | void>} HTTP response or continuation of request.
 */
const authMiddlware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    const user = await Admin.findById(decoded.id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
  }
};

export default authMiddlware;
