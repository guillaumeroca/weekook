export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorise') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource non trouvee') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Donnees invalides') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acces interdit') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}
