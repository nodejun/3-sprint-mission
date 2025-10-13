export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends HttpError {
  details: Array<{ type: string; message: string; path: string; value: any; }>;

  constructor(message: string, details: Array<{ type: string; message: string; path: string; value: any; }>) {
    super(message, 400);
    this.details = details;
  }
}