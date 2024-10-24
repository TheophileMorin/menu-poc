"use client";
import { cn } from "@/app/utils/css-merge";
import type { MenuNodeConfig } from "@/components/menu/menu.models";
import { menuNodeValidator } from "@/components/menu/menu.validators";
import { ArrowRight } from "lucide-react";
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";

export function NavigationMenu({ config }: { config: MenuNodeConfig[] }) {
  const [invalidFormat, setInvalidFormat] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<MenuNodeConfig | null>(null);

  // Used useLayoutEffect to prevent rendering an unvalid menu configuration
  useLayoutEffect(() => {
    // Assert that the content is valid
    const menuContent = menuNodeValidator.safeParse(config);
    if (!menuContent.success) {
      setInvalidFormat(true);
      console.error(menuContent.error);
    } else {
      setInvalidFormat(false);
    }
  }, [config]);

  const clickOnNode = useCallback((node: MenuNodeConfig): void => {
    setSelectedNode(node); // TODO
  }, []);
  const clickOnPrevious = useCallback((): void => {
    setSelectedNode(null); // TODO
  }, []);

  if (invalidFormat)
    return (
      <ul className="w-[420px] flex flex-col items-center justify-center">
        <li className="text-red-600 w-fit">Invalid menu configuration :/</li>
      </ul>
    );

  return (
    <nav className="w-[420px]">
      <ul className="flex flex-col">
        {!!selectedNode && <MenuPreviousNode handleClick={clickOnPrevious} />}
        {(selectedNode?.subNodes || config).map(
          (node: MenuNodeConfig, index: number) => (
            <MenuNode
              node={node}
              key={`${node.label}-${index}`}
              handleClick={clickOnNode}
            />
          )
        )}
      </ul>
    </nav>
  );
}

/**
 * MenuNodeWrapper is a wrapper around the MenuNode component
 * that handles the correct way to interract with the node.
 */
const MenuNodeWrapper = forwardRef<
  ElementRef<"li">,
  ComponentPropsWithoutRef<"li"> & {
    node: MenuNodeConfig;
    handleClick: (node: MenuNodeConfig) => void;
  }
>(({ node, handleClick, className, children, ...props }, ref) => {
  const isLink = !!node.href;
  return (
    <li ref={ref} {...props}>
      {isLink ? (
        <a
          href={node.href}
          className={className}
          aria-label={`navigate to ${node.label}`}
        >
          {children}
        </a>
      ) : (
        <button
          className={className}
          onClick={() => handleClick(node)}
          aria-label={`open sub menu ${node.label}`}
        >
          {children}
        </button>
      )}
    </li>
  );
});
MenuNodeWrapper.displayName = "MenuNodeWrapper";

/**
 * MenuNode is a UI component that render a single node in the menu.
 */
const MenuNode = forwardRef<
  ElementRef<typeof MenuNodeWrapper>,
  ComponentPropsWithoutRef<typeof MenuNodeWrapper> & {
    node: MenuNodeConfig;
    handleClick: (node: MenuNodeConfig) => void;
  }
>(({ node, handleClick, className, ...props }, ref) => {
  return (
    <MenuNodeWrapper
      {...props}
      ref={ref}
      node={node}
      handleClick={handleClick}
      className={cn(
        className,
        "group h-[48px] w-full gap-[14px] flex items-center text-left cursor-pointer px-[14px] text-sm bg-[#F7F7F7] text-[#323232] hover:bg-[#D1EDFB] hover:text-[#323232] active:bg-[#AEDFFB] transition-colors duration-200"
      )}
    >
      <p className="grow line-clamp-1 font-medium">{node.label}</p>
      {node.subNodes && (
        <span className="w-8 h-8 flex items-center justify-center">
          <ArrowRight
            className="w-[18px] h-[18px] text-[#B9B9B9] group-hover:text-[#323C3F]"
            size={18}
          />
        </span>
      )}
    </MenuNodeWrapper>
  );
});
MenuNode.displayName = "MenuNode";

/**
 * MenuPreviousNode is a UI component that render the previous.
 */
const MenuPreviousNode = forwardRef<
  ElementRef<"li">,
  ComponentPropsWithoutRef<"li"> & {
    handleClick: () => void;
  }
>(({ handleClick, className, ...props }, ref) => {
  return (
    <li
      {...props}
      ref={ref}
      className={cn(
        "h-[42px] w-full flex items-center text-left bg-[#F7F7F7] text-[#B9B9B9] px-[14px]",
        className
      )}
    >
      <button
        className="hover:text-[#323C3F] w-8 h-8 transition-colors duration-200 flex items-center justify-center"
        onClick={handleClick}
        aria-label={`back from sub-menu`}
      >
        <ArrowRight className="w-[18px] h-[18px] rotate-180" size={18} />
      </button>
    </li>
  );
});
MenuPreviousNode.displayName = "MenuPreviousNode";
