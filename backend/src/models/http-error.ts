export interface IHttpError extends Error {
  code?: number;
}

export class HttpError extends Error implements IHttpError {
  public code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}
