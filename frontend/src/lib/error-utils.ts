/**
 * Extracts error message from an error object
 * @param error - The error object (as any type)
 * @returns The error message string
 */
export function getErrorMessage(error: any): string {
  // Check if shortMessage exists and is not empty
  if (error?.shortMessage && typeof error.shortMessage === 'string' && error.shortMessage.trim() !== '') {
    return error.shortMessage;
  }
  
  // Check if regular message exists and is not empty
  if (error?.message && typeof error.message === 'string' && error.message.trim() !== '') {
    return error.message;
  }
  
  // Return default error message if no specific message is found
  return "An unexpected error occurred. Please try again.";
}