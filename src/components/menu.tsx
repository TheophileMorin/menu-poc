"use client";
import { ArrowRight } from "lucide-react";
import React from "react";
import { z } from "zod";

export type MenuItem = {
  label: string;
  href?: string;
  children?: MenuItem[];
};

const existingStringValidator = z.string().trim().min(1);
const menuContentValidator: z.ZodSchema<MenuItem[]> = z.lazy(() =>
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
            children: menuContentValidator,
          })
          .strict(),
      ])
    )
    .min(1)
);

export function NavigationMenu({ content }: { content: MenuItem[] }) {
  // Assert that the content is valid
  menuContentValidator.parse(content);

  return (
    <ul className="w-[26.25rem] flex flex-col">
      {content.map((item: MenuItem, index: number) => (
        <MenuItem item={item} key={`${item.label}-${index}`} />
      ))}
    </ul>
  );
}

function MenuItem({ item }: { item: MenuItem }) {
  // We assume font-size 12px
  // We assume line-height 20px

  return (
    <li className="group h-[48px] w-full flex items-center cursor-pointer p-[14px] bg-[#F7F7F7] text-[#323232] hover:bg-[#D1EDFB] hover:text-[#323232] active:bg-[#AEDFFB] transition-colors duration-200">
      <p className="grow text-[12px] leading-5 line-clamp-1">{item.label}</p>
      {item.children && (
        <ArrowRight
          className="w-3 h-3 text-[#B9B9B9] group-hover:text-[#323C3F]"
          size={12}
        />
      )}
    </li>
  );
}
