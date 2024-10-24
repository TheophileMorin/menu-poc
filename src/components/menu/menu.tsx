"use client";
import { cn } from "@/app/utils/css-merge";
import type { MenuItem } from "@/components/menu/menu.models";
import { menuContentValidator } from "@/components/menu/menu.validators";
import { ArrowRight } from "lucide-react";
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";

export function NavigationMenu({ content }: { content: MenuItem[] }) {
  const [invalidFormat, setInvalidFormat] = useState<boolean>(false);

  // Used useLayoutEffect to prevent rendering an unvalid menu configuration
  useLayoutEffect(() => {
    // Assert that the content is valid
    const menuContent = menuContentValidator.safeParse(content);
    if (!menuContent.success) {
      setInvalidFormat(true);
      console.error(menuContent.error);
    } else {
      setInvalidFormat(false);
    }
  }, [content]);

  const handleClick = useCallback((item: MenuItem): void => {
    console.log(item);
  }, []);

  return (
    <ul className="w-[420px] flex flex-col">
      {invalidFormat ? (
        <li className="text-red-600">Invalid menu configuration :/</li>
      ) : (
        content.map((item: MenuItem, index: number) => (
          <MenuItem
            item={item}
            key={`${item.label}-${index}`}
            handleClick={handleClick}
          />
        ))
      )}
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
      {item.subItems && (
        <ArrowRight
          className="w-3 h-3 text-[#B9B9B9] group-hover:text-[#323C3F]"
          size={12}
        />
      )}
    </MenuItemWrapper>
  );
});
MenuItem.displayName = "MenuItem";
