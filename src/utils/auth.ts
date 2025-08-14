import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWTPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateGoogleToken = (
  payload: JWTPayload,
  googleAccessToken: string
): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      googleAccessToken,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
