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
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function NavigationMenu({
  config,
  className,
}: {
  config: MenuNodeConfig[];
  className?: string;
}) {
  const [invalidFormat, setInvalidFormat] = useState<boolean>(false);
  const [renderedBreadcrumbs, setRenderedBreadcrumbs] = useState<
    Array<MenuNodeConfig | null>
  >([null]);
  const [breadcrumbsIndex, setBreadcrumbsIndex] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number | null>(null);
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  const listRefs = useRef<Array<HTMLUListElement | null>>([]);
  const navRef = useRef<HTMLDivElement>(null);

  // Validate input config
  useLayoutEffect(() => {
    // PS: Used useLayoutEffect here to prevent rendering an unvalid menu configuration
    const menuContent = menuNodeValidator.safeParse(config);
    if (!menuContent.success) {
      setInvalidFormat(true);
      console.error(menuContent.error); // Adapt to
    } else {
      setInvalidFormat(false);
    }
  }, [config]);

  // Update the menu height and the menu viewport position when currentIndex changes
  useEffect(() => {
    // Update height to the new list height
    if (!listRefs) return;
    const currentRef = listRefs.current?.[breadcrumbsIndex];
    setCurrentHeight(currentRef?.offsetHeight || 0);

    // Update the viewport position
    const navWidth = navRef.current?.offsetWidth || 0;
    setViewportOffset(-breadcrumbsIndex * navWidth);
  }, [breadcrumbsIndex]);

  const clickOnNode = useCallback(
    (node: MenuNodeConfig): void => {
      // TODO prevent multiple clicks hell
      // Update current index for next rendering
      setBreadcrumbsIndex((c) => c + 1);
      // We erase the end of breadcrumbs based on currentIndex and add the new node
      setRenderedBreadcrumbs((b) =>
        [...b].slice(0, breadcrumbsIndex + 1).concat([node])
      );
    },
    [breadcrumbsIndex]
  );
  const clickOnPrevious = useCallback((): void => {
    // We just update the viewport
    setBreadcrumbsIndex((c) => (c === 0 ? 0 : c + -1));
  }, []);

  if (invalidFormat)
    return (
      <nav
        className={cn(
          "flex flex-col items-center justify-center z-10 text-red-600",
          className
        )}
      >
        Invalid menu configuration :/
      </nav>
    );

  return (
    <nav
      className={cn(
        "z-10 overflow-hidden",
        "transition-height duration-300 ease-in-out",
        className
      )}
      ref={navRef}
      style={{ height: currentHeight ?? "initial" }}
    >
      <div
        className="flex flex-row relative transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(${viewportOffset}px)`,
        }}
      >
        {renderedBreadcrumbs.map((node, index) => (
          <MenuNodeList
            key={`depth-${index}`}
            ref={(el) => {
              (listRefs.current ?? [])[index] = el;
            }}
            className={cn("min-w-full h-fit")}
            isRoot={node === null}
            nodes={node === null ? config : node.subNodes ?? []}
            handleClick={clickOnNode}
            handlePreviousClick={clickOnPrevious}
          />
        ))}
      </div>
    </nav>
  );
}

const MenuNodeList = forwardRef<
  ElementRef<"ul">,
  ComponentPropsWithoutRef<"ul"> & {
    isRoot: boolean;
    nodes: MenuNodeConfig[];
    handleClick: (node: MenuNodeConfig) => void;
    handlePreviousClick: () => void;
  }
>(
  (
    { isRoot, nodes, handleClick, handlePreviousClick, className, ...props },
    ref
  ) => {
    return (
      <ul {...props} ref={ref} className={cn("flex flex-col", className)}>
        {!isRoot && <MenuPreviousNode handleClick={handlePreviousClick} />}
        {nodes.map((node: MenuNodeConfig, index: number) => (
          <MenuNode
            node={node}
            key={`${node.label}-${index}`}
            handleClick={handleClick}
          />
        ))}
      </ul>
    );
  }
);
MenuNodeList.displayName = "MenuNodeList";
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
