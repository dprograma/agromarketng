import { NextApiRequest } from "next";

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserToken {
  id: string;
  email: string;
  name?: string;
};

export interface MulterRequest extends NextApiRequest {
  file?: Express.Multer.File;
}

export interface AlertProps {
  message: string;
  type?: string;
  duration?: number;
}

export interface Session {
  name?: string;
  email?: string;
}
