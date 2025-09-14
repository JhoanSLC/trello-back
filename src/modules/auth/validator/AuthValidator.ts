import z from "zod";

export class AuthValidator {

    static loginSchema = z.object({
        email: z.email('Has to be a valid email').nonempty('Is required'),
        password: z.string('Has to be a string').nonempty('Is required').min(6, 'Must be at least 6 characters')
    })

}
