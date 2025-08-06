// Utility functions for form handling

/**
 * Validates that a string contains only numbers
 * @param value - The string value to validate
 * @returns true if the value is empty or contains only numbers, false otherwise
 */
export const validateNumbersOnly = (value: string): boolean => {
  if (!value || value.trim() === '') return true;
  return /^\d+$/.test(value.trim());
};

/**
 * Formats a number input to ensure it only contains digits
 * @param value - The input value
 * @returns The formatted value with only digits
 */
export const formatNumberInput = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Creates validation rules for number-only text inputs
 * @param required - Whether the field is required
 * @param errorMessage - Custom error message
 * @returns Validation object
 */
export const createNumberOnlyValidation = (required: boolean = true, errorMessage: string = 'Only numbers are allowed') => {
  return {
    required: required ? errorMessage : false,
    validate: (value: string) => {
      if (required && (!value || value.trim() === '')) {
        return errorMessage;
      }
      if (value && !validateNumbersOnly(value)) {
        return errorMessage;
      }
      return true;
    }
  };
};

/**
 * Handles onChange for number-only text inputs
 * @param value - The input value
 * @param setValue - Function to set the form value
 * @param fieldName - The field name
 * @returns The formatted value
 */
export const handleNumberOnlyChange = (value: string, setValue: (field: string, value: any) => void, fieldName: string): string => {
  const formattedValue = formatNumberInput(value);
  setValue(fieldName, formattedValue);
  return formattedValue;
}; 