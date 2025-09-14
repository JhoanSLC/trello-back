import { RequestHandler } from "express";
import { ZodSchema } from "zod";

/**
 *
 * @param schema - Zod schema to validate
 * @param opts Other options like status code or sources
 */
export const validateSchema = (schema: ZodSchema<any>, opts?: { status?: number }): RequestHandler => {
    const status = opts?.status ?? 400; // Get the status code from the options

    return async (req, res, next) => {
        const dataToValidate = { ...req.body, ...req.query, ...req.params }; // Merge body, query, and params to validate a single object

        const result = await schema.safeParseAsync(dataToValidate); // Validate data

        if (result.success) {
            return next(); // If validation is successful, continue to the next middleware
        }

        const errors: Record<string, string[]> = {}; // Initialize errors object

        for (const issue of result.error.issues) { // Loop through validation errors
            const path = issue.path.map(String).join('.') || '_root'; // Get the path of the error
            if (!errors[path]) errors[path] = []; // Initialize path if it doesn't exist
            errors[path].push(issue.message); // Add error message to path
        }

        return res.status(status).json({ errors });
    };
};
