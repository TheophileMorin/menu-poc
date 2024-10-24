import type { MenuNodeConfig } from "@/components/menu/menu.models";
import { z } from "zod";

const existingStringValidator = z.string().trim().min(1);

export const menuNodeValidator: z.ZodSchema<MenuNodeConfig[]> = z.lazy(() =>
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
            subNodes: menuNodeValidator,
          })
          .strict(),
      ])
    )
    .min(1)
);
