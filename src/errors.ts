export interface ErrorBody {
  detail: string;
  message: string;
  status: number;
}

export class VyncoError extends Error {
  constructor(
    message: string,
    public readonly body?: ErrorBody,
  ) {
    super(message);
    this.name = "VyncoError";
  }
}

export class AuthenticationError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`authentication error: ${body.detail}`, body);
    this.name = "AuthenticationError";
  }
}

export class InsufficientCreditsError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`insufficient credits: ${body.detail}`, body);
    this.name = "InsufficientCreditsError";
  }
}

export class ForbiddenError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`forbidden: ${body.detail}`, body);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`not found: ${body.detail}`, body);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`validation error: ${body.detail}`, body);
    this.name = "ValidationError";
  }
}

export class ConflictError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`conflict: ${body.detail}`, body);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`rate limited: ${body.detail}`, body);
    this.name = "RateLimitError";
  }
}

export class ServerError extends VyncoError {
  constructor(body: ErrorBody) {
    super(`server error: ${body.detail}`, body);
    this.name = "ServerError";
  }
}

export class NetworkError extends VyncoError {
  constructor(cause: unknown) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    super(`network error: ${msg}`);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export class DeserializeError extends VyncoError {
  constructor(cause: unknown) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    super(`deserialization error: ${msg}`);
    this.name = "DeserializeError";
    this.cause = cause;
  }
}

export class TimeoutError extends VyncoError {
  constructor() {
    super("request timed out");
    this.name = "TimeoutError";
  }
}

export class ConfigError extends VyncoError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
