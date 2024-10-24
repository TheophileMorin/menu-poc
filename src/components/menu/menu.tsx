"use client";
import { cn } from "@/app/utils/css-merge";
import type { MenuNodeConfig } from "@/components/menu/menu.models";
import { menuNodeValidator } from "@/components/menu/menu.validators";
import { ArrowRight } from "lucide-react";
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const NavigationMenu = forwardRef<
  ElementRef<"nav">,
  ComponentPropsWithoutRef<"nav"> & { config: MenuNodeConfig[] }
>(({ config, className, ...props }, forwardedRef) => {
  const [invalidFormat, setInvalidFormat] = useState<boolean>(false);
  const [renderedBreadcrumbs, setRenderedBreadcrumbs] = useState<
    Array<MenuNodeConfig | null>
  >([null]);
  const [breadcrumbsIndex, setBreadcrumbsIndex] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number | null>(null);
  // const [currentWidth, setCurrentWidth] = useState<number | null>(null);
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  // const [isResizing, setIsResizing] = useState<boolean>(false);
  const listRefs = useRef<Array<HTMLUListElement | null>>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Reforward the navRef to the forwardedRef
  useImperativeHandle(forwardedRef, () => navRef.current as HTMLDivElement);

  // On mount
  // useEffect(() => {
  //   const updateViewportOffset = () => {
  //     if (!navRef.current) return;
  //     const navWidth = navRef.current?.offsetWidth || 0;
  //     setCurrentWidth(navWidth);
  //   };

  //   // const handleResize = () => {
  //   //   if (viewportRef.current) {
  //   //     viewportRef.current.classList.remove("transition-transform");
  //   //   }
  //   //   updateViewportOffset();
  //   // };

  //   // const handleResizeEnd = () => {
  //   //   if (viewportRef.current) {
  //   //     viewportRef.current.classList.add("transition-transform");
  //   //   }
  //   // };

  //   window.addEventListener("resize", () => {
  //     setIsResizing(true);
  //     updateViewportOffset();
  //   });

  //   // Initial calculation
  //   updateViewportOffset();
  //   return () => {
  //     window.addEventListener("resize", () => {
  //       setIsResizing(false);
  //       updateViewportOffset();
  //     });
  //   };
  // }, []);

  // Validate input config
  useLayoutEffect(() => {
    // PS: Used useLayoutEffect here to prevent rendering an unvalid menu configuration
    const menuContent = menuNodeValidator.safeParse(config);
    if (!menuContent.success) {
      setInvalidFormat(true);
      console.error(menuContent.error); // Adapt to use error reporting
    } else {
      setInvalidFormat(false);
    }
  }, [config]);

  // Update the menu height and viewport position when currentIndex changes
  useEffect(() => {
    // Update height to the new list height
    if (!listRefs) return;
    const currentRef = listRefs.current?.[breadcrumbsIndex];
    setCurrentHeight(currentRef?.offsetHeight || 0);

    // Update the viewport position
    const navWidth = navRef.current?.offsetWidth || 0;
    setViewportOffset(-breadcrumbsIndex * navWidth);
  }, [breadcrumbsIndex]);
  // }, [breadcrumbsIndex, currentWidth]);

  const clickOnNode = useCallback(
    (node: MenuNodeConfig): void => {
      // TODO prevent multiple clicks hell
      // Moves the index
      setBreadcrumbsIndex((c) => c + 1);
      // We erase the end of breadcrumbs kept in memory and add the new node
      setRenderedBreadcrumbs((b) =>
        [...b].slice(0, breadcrumbsIndex + 1).concat([node])
      );
    },
    [breadcrumbsIndex] // TODO improve ?
  );

  const clickOnPrevious = useCallback((): void => {
    // Moves the index
    setBreadcrumbsIndex((c) => Math.max(0, c - 1));
  }, []);

  // console.log("rendering NavigationMenu");
  return (
    <nav
      {...props}
      className={cn(
        "z-10 overflow-hidden",
        "transition-height duration-300 ease-in-out",
        className
      )}
      ref={navRef}
      style={{ height: currentHeight ?? "initial" }}
    >
      {invalidFormat ? (
        <span className="text-red-500">Invalid menu configuration.</span>
      ) : (
        <div
          className={cn(
            "flex flex-row relative",
            "transition-transform duration-300 ease-in-out"
            // isResizing ? "" : "transition-transform duration-300 ease-in-out"
          )}
          ref={viewportRef}
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
      )}
    </nav>
  );
});
NavigationMenu.displayName = "NavigationMenu";

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
    // console.log("rendering MenuNodeList");
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
  // console.log("rendering MenuNodeWrapper");
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
 * MenuItem is a UI component that render a single node in the menu.
 */
const MenuNode = memo(
  forwardRef<
    ElementRef<typeof MenuNodeWrapper>,
    ComponentPropsWithoutRef<typeof MenuNodeWrapper> & {
      node: MenuNodeConfig;
      handleClick: (node: MenuNodeConfig) => void;
    }
  >(({ node, handleClick, className, ...props }, ref) => {
    // console.log("rendering MenuNode");
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
  })
);
MenuNode.displayName = "MenuNode";

/**
 * MenuPreviousNode is a UI component that render the previous.
 */
const MenuPreviousNode = memo(
  forwardRef<
    ElementRef<"li">,
    ComponentPropsWithoutRef<"li"> & {
      handleClick: () => void;
    }
  >(({ handleClick, className, ...props }, ref) => {
    // console.log("rendering MenuPreviousNode");
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
  })
);
MenuPreviousNode.displayName = "MenuPreviousNode";
