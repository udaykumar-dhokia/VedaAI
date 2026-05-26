import { Request, Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import Admin, { IAdmin } from "../admin/admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Login request payload.
 *
 * @property {string} email - User email address for authentication.
 * @property {string} password - Plain text password submitted by the user.
 */
interface LoginReqParams {
  email: string;
  password: string;
}

const AuthController = {
  /**
   * Authenticate an admin user and issue a JWT cookie.
   *
   * Validates the request body, checks credentials against the stored admin
   * record, and returns the authenticated user without the password field.
   *
   * @param {Request} req - Express request object containing login payload.
   * @param {Response} res - Express response object for sending results.
   * @returns {Promise<Response>} HTTP response with user data or an error status.
   */
  login: async (req: Request, res: Response): Promise<Response> => {
    const body: LoginReqParams = req.body;
    if (!body || !body.email || !body.password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: ReasonPhrases.BAD_REQUEST });
    }

    try {
      const user: IAdmin | null = await Admin.findOne({
        email: body.email.toLowerCase(),
      }).select("+password");
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: ReasonPhrases.NOT_FOUND });
      }

      const isPasswordMatch = await bcrypt.compare(
        body.password,
        user.password!,
      );

      if (!isPasswordMatch) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: ReasonPhrases.NOT_FOUND });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" },
      );

      const userObj = user.toObject();
      delete userObj.password;

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(StatusCodes.OK).json({
        user: userObj,
      });
    } catch (e) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  },
};

export default AuthController;
