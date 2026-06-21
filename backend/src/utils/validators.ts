import { validate, ValidationError } from 'class-validator';

export const formatValidationErrors = (errors: ValidationError[]): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};
  errors.forEach((error) => {
    if (error.constraints) {
      formatted[error.property] = Object.values(error.constraints);
    }
  });
  return formatted;
};

export const validateEntity = async (entity: object): Promise<Record<string, string[]> | null> => {
  const errors = await validate(entity);
  if (errors.length > 0) {
    return formatValidationErrors(errors);
  }
  return null;
};
