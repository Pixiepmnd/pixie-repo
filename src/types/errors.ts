/**
 * Custom error types for Pixie
 */

export class PixieError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PixieError';
  }
}

export class ValidationError extends PixieError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TransactionError extends PixieError {
  public signature?: string;

  constructor(message: string, signature?: string) {
    super(message);
    this.name = 'TransactionError';
    this.signature = signature;
  }
}

export class NetworkError extends PixieError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class InsufficientBalanceError extends PixieError {
  public required: number;
  public available: number;

  constructor(required: number, available: number) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientBalanceError';
    this.required = required;
    this.available = available;
  }
}

export class RiskError extends PixieError {
  public riskLevel: string;

  constructor(message: string, riskLevel: string) {
    super(message);
    this.name = 'RiskError';
    this.riskLevel = riskLevel;
  }
}

export class ParseError extends PixieError {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}
