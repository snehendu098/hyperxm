import { NextResponse } from "next/server";

type ErrorResponseType = {
  success: boolean;
  message: string;
  error?: string;
  stack?: string;
};

/**
 * Handle API errors consistently
 * @param error Error object
 * @param includeStack Include stack trace in development
 * @returns NextResponse with formatted error
 */
export function handleApiError(
  error: unknown,
  includeStack = process.env.NODE_ENV === "development"
): NextResponse {
  console.error("API Error:", error);

  const errorObj = error as Error;
  const response: ErrorResponseType = {
    success: false,
    message: errorObj.message || "Internal server error",
  };

  // Add error name if available
  if (errorObj.name && errorObj.name !== "Error") {
    response.error = errorObj.name;
  }

  // Include stack trace in development
  if (includeStack && errorObj.stack) {
    response.stack = errorObj.stack;
  }

  // Handle MongoDB validation errors
  if (errorObj.name === "ValidationError") {
    return NextResponse.json(response, { status: 400 });
  }

  // Handle duplicate key errors
  if ((errorObj as any).code === 11000) {
    response.message = "Duplicate entry error";
    return NextResponse.json(response, { status: 409 });
  }

  return NextResponse.json(response, { status: 500 });
}
