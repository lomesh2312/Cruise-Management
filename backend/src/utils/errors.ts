import { Response } from 'express';

export const asyncHandler = (fn: Function) => (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
