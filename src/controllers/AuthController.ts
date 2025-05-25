import { Request, Response } from "express";
import Auth from "../models/Auth";
import {
  TAuth,
  PickLogin,
  PickRegister,
  JwtPayload,
  PickLogout,
} from "../types/auth.types";
import { verifyToken } from "../middleware/auth";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickRegister = req.body;

      if (!auth.email || !auth.fullName || !auth.phone || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All field is required",
        });
        return;
      }

      const isAlreadyRegistered: TAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (isAlreadyRegistered) {
        res.status(400).json({
          status: 400,
          message: "This email is already registered, try another email",
        });
        return;
      }

      bcryptjs.hash(auth.password, 10, async (err, hash): Promise<void> => {
        if (err) {
          res.status(500).json(err);
          return;
        }
        const newAuth = new Auth({
          email: auth.email,
          fullName: auth.fullName,
          phone: auth.phone,
          password: hash,
        });

        await newAuth.save();

        res.status(201).json({
          status: 200,
          data: newAuth,
          message: "account successfully registered",
        });

        return;
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
      return;
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickLogin = req.body;

      if (!auth.email || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All field is required",
        });
        return;
      }

      const isAuthExist: TAuth | null = await Auth.findOne({
        email: auth.email,
      });
      if (!isAuthExist) {
        res.status(404).json({
          status: 404,
          message: "Account not found",
        });
        return;
      }

      const validateAuth = await bcryptjs.compare(
        auth.password,
        isAuthExist.password
      );

      if (!validateAuth) {
        res
          .status(400)
          .json({ status: 400, message: "Wrong email or password" });
        return;
      }

      const payload: JwtPayload = {
        _id: isAuthExist._id,
        email: isAuthExist.email,
        fullName: isAuthExist.fullName,
        phone: isAuthExist.phone,
      };

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        res.status(500).json({
          status: 500,
          message: "Server configuration error.",
        });
        return;
      }
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        async (err, token): Promise<void> => {
          if (err) {
            res.status(500).json(err);
            return;
          }

          isAuthExist.set("token", token);
          await isAuthExist.save();
          res.status(200).json({
            status: 200,
            data: isAuthExist,
            message: "Login successfully",
          });

          return;
        }
      );
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
      return;
    }
  };

  public logout = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickLogout = req.user as JwtPayload;

        const auth: TAuth | null = await Auth.findById(_id);

        if (!auth) {
          res.status(404).json({
            status: 404,
            message: "Account not found",
          });
          return;
        }

        auth.set("token", null);
        await auth.save();

        res.status(200).json({
          status: 2000,
          message: "Account logut successfully",
        });

        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Internal server error",
        });
        return;
      }
    },
  ];
}

export default new AuthController();
