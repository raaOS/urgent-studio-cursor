import { z } from "zod";

// Menggunakan zod sebagai pengganti yup karena yup tidak tersedia
export const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});