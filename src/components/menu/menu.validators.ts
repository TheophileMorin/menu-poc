import type { MenuItem } from "@/components/menu/menu.models";
import { z } from "zod";

const existingStringValidator = z.string().trim().min(1);

export const menuContentValidator: z.ZodSchema<MenuItem[]> = z.lazy(() =>
  z
    .array(
      z.union([
        z
          .object({
            label: existingStringValidator,
            href: existingStringValidator,
          })
          .strict(),
        z
          .object({
            label: existingStringValidator,
            subItems: menuContentValidator,
          })
          .strict(),
      ])
    )
    .min(1)
);
