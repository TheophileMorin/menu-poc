"use client";
import { cn } from "@/app/utils/css-merge";
import { ArrowRight } from "lucide-react";
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useCallback,
} from "react";
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

  const handleClick = useCallback((item: MenuItem): void => {
    console.log(item);
  }, []);

  return (
    <ul className="w-[420px] flex flex-col">
      {content.map((item: MenuItem, index: number) => (
        <MenuItem
          item={item}
          key={`${item.label}-${index}`}
          handleClick={handleClick}
        />
      ))}
    </ul>
  );
}

/**
 * MenuItemWrapper is a wrapper around the MenuItem component
 * that handles the correct way to interract with the item.
 */
const MenuItemWrapper = forwardRef<
  ElementRef<"li">,
  ComponentPropsWithoutRef<"li"> & {
    item: MenuItem;
    handleClick: (item: MenuItem) => void;
  }
>(({ item, handleClick, className, children, ...props }, ref) => {
  const isLink = !!item.href;
  return (
    <li ref={ref} {...props}>
      {isLink ? (
        <a
          href={item.href}
          className={className}
          aria-label={`navigate to ${item.label}`}
        >
          {children}
        </a>
      ) : (
        <button
          className={className}
          onClick={() => handleClick(item)}
          aria-label={`open sub-menu ${item.label}`}
        >
          {children}
        </button>
      )}
    </li>
  );
});
MenuItemWrapper.displayName = "MenuItemWrapper";

/**
 * MenuItem is a UI component that represents a single item in the menu.
 */
const MenuItem = forwardRef<
  ElementRef<typeof MenuItemWrapper>,
  ComponentPropsWithoutRef<typeof MenuItemWrapper> & {
    item: MenuItem;
    handleClick: (item: MenuItem) => void;
  }
>(({ item, handleClick, className, ...props }, ref) => {
  return (
    <MenuItemWrapper
      {...props}
      item={item}
      handleClick={handleClick}
      ref={ref}
      className={cn(
        className,
        "group h-[48px] w-full flex items-center text-left cursor-pointer p-[14px] bg-[#F7F7F7] text-[#323232] hover:bg-[#D1EDFB] hover:text-[#323232] active:bg-[#AEDFFB] transition-colors duration-200"
      )}
    >
      <p className="grow text-[12px] leading-5 line-clamp-1">{item.label}</p>
      {item.children && (
        <ArrowRight
          className="w-3 h-3 text-[#B9B9B9] group-hover:text-[#323C3F]"
          size={12}
        />
      )}
    </MenuItemWrapper>
  );
});
MenuItem.displayName = "MenuItem";
