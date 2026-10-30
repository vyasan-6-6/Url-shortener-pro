import { Document, Types } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface IUrl extends Document {
  _id: Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  userId: Types.ObjectId;
  clicks: number;
  expiresAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClick extends Document {
  _id: Types.ObjectId;
  urlId: Types.ObjectId;
  browser: string;
  ip: string;
  referrer: string;
  clickedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
