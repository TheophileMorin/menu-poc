"use client";
import { cn } from "@/app/utils/css-merge";
import type { MenuNodeConfig } from "@/components/menu/menu.models";
import { menuNodeValidator } from "@/components/menu/menu.validators";
import {
  NavigationContext,
  NavigationProvider,
} from "@/components/menu/navigation-provider";
import { ArrowRight } from "lucide-react";
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  memo,
  useCallback,
  useContext,
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
    Array<MenuNodeConfig | "ROOT">
  >(["ROOT"]);
  const [breadcrumbsIndex, setBreadcrumbsIndex] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number | null>(null);
  const [currentWidth, setCurrentWidth] = useState<number | null>(null);
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  const [windowResizing, setWindowResizing] = useState(false);
  const [newNode, setNewNode] = useState<MenuNodeConfig | null>(null);
  const listRefs = useRef<Array<HTMLUListElement | null>>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Reforward the navRef to the forwardedRef
  useImperativeHandle(forwardedRef, () => navRef.current as HTMLDivElement);

  // Validate input config
  useLayoutEffect(() => {
    const menuContent = menuNodeValidator.safeParse(config);
    if (!menuContent.success) {
      setInvalidFormat(true);
      console.error(menuContent.error); // Adapt to use error reporting
    } else {
      setInvalidFormat(false);
    }
  }, [config]);

  // For being efficient in responsiveness
  // We prevent rendering at every resize event - a choice to discuss.
  // Because we transform:translate, we have ton bind the width and the offset...
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const onWindowResize = () => {
      clearTimeout(timeout);
      setWindowResizing(true); // Prevents the menu from animating while the window is resizing
      timeout = setTimeout(() => {
        setWindowResizing(false);
      }, 200);
    };

    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (windowResizing) return;
    if (!navRef.current) return;
    const navWidth = navRef.current?.offsetWidth || 0;
    setCurrentWidth(navWidth);
  }, [windowResizing]);

  // Update the menu height and viewport position when currentIndex changes
  useEffect(() => {
    if (!listRefs) return;
    const newListRef = listRefs.current?.[breadcrumbsIndex];
    setCurrentHeight(newListRef?.offsetHeight || 0); // For height animation

    // Update the viewport position, to show the new list !
    setViewportOffset(-breadcrumbsIndex * (currentWidth ?? 0));
  }, [breadcrumbsIndex, currentWidth]);

  // Do the job of navigate().
  // Trigerring the effect allow to remove breadcrumbsIndex dependency of navigate useCallback.
  useEffect(() => {
    if (!newNode) return;
    setBreadcrumbsIndex((c) => c + 1); // Moves the index

    // We override breadcrumbs deeper in the tree (kept in memory) with new node
    setRenderedBreadcrumbs((b) => [
      ...b.slice(0, breadcrumbsIndex + 1),
      newNode,
    ]);

    setNewNode(null); // Changes are done, reset the marker
  }, [breadcrumbsIndex, newNode]);

  const navigate = useCallback((node: MenuNodeConfig) => {
    setNewNode(node);
  }, []);
  const navigateBack = useCallback(() => {
    setBreadcrumbsIndex((c) => Math.max(0, c - 1));
  }, []);
  const setListRefs = useCallback(
    (index: number) => (el: HTMLUListElement | null) => {
      listRefs.current[index] = el;
    },
    []
  );

  return (
    <NavigationProvider navigate={navigate} navigateBack={navigateBack}>
      <nav
        {...props}
        ref={navRef}
        className={cn(
          "z-10 overflow-hidden",
          "transition-height duration-300 ease-in-out",
          className
        )}
        style={{ height: currentHeight ?? "initial" }}
      >
        {invalidFormat ? (
          <span className="text-error">Invalid menu configuration.</span>
        ) : (
          <div
            ref={viewportRef}
            className={cn(
              "flex flex-row relative",
              !windowResizing && "transition-transform duration-300 ease-in-out"
            )}
            style={{
              transform: `translateX(${viewportOffset}px)`,
            }}
          >
            {renderedBreadcrumbs.map((node, index) => (
              <span
                key={`depth-${index}`}
                ref={setListRefs(index)}
                className="min-w-full h-fit"
              >
                <MenuNodeList
                  isRoot={node === "ROOT"}
                  nodes={node === "ROOT" ? config : node.subNodes ?? []}
                />
              </span>
            ))}
          </div>
        )}
      </nav>
    </NavigationProvider>
  );
});
NavigationMenu.displayName = "NavigationMenu";

/**
 * MenuNodeList show a vertical list of nodes.
 * Show a previous button if it's not the root.
 */
const MenuNodeList = memo(function MenuNodeList({
  isRoot,
  nodes,
  ...props
}: ComponentProps<"ul"> & {
  isRoot: boolean;
  nodes: MenuNodeConfig[];
}) {
  return (
    <ul {...props} className="flex flex-col">
      {!isRoot && <MenuPreviousItem />}
      {nodes.map((node: MenuNodeConfig, index: number) => (
        <MenuItem node={node} key={`${index}-${node.label}`} />
      ))}
    </ul>
  );
});
MenuNodeList.displayName = "MenuNodeList";

/**
 * MenuItemWrapper provides a proper semantic html tag to interract with the node.
 */
const MenuItemWrapper = memo(function MenuNodeWrapper({
  node,
  className,
  children,
  ...props
}: ComponentProps<"li"> & {
  node: MenuNodeConfig;
}) {
  const { navigate } = useContext(NavigationContext);
  if ("href" in node)
    return (
      <li {...props}>
        <a
          href={node.href}
          className={className}
          aria-label={`navigate to ${node.label}`}
        >
          {children}
        </a>
      </li>
    );
  else
    return (
      <li {...props}>
        <button
          className={className}
          onClick={() => navigate(node)}
          aria-label={`open sub menu ${node.label}`}
        >
          {children}
        </button>
      </li>
    );
});
MenuItemWrapper.displayName = "MenuItemWrapper";

/**
 * MenuItem is a UI component that render a single node in the menu.
 */
const MenuItem = memo(function MenuItem({
  node,
  className,
  ...props
}: ComponentProps<typeof MenuItemWrapper> & {
  node: MenuNodeConfig;
}) {
  return (
    <MenuItemWrapper
      {...props}
      node={node}
      className={cn(
        "group h-[48px] w-full px-[14px]",
        "flex items-center gap-[14px] cursor-pointer",
        "text-sm text-left bg-surface1 text-onWhite1 hover:bg-accent active:bg-accent2",
        "transition-colors duration-200",
        className
      )}
    >
      <p className="grow line-clamp-1 font-medium">{node.label}</p>
      {node.subNodes && (
        <span className="w-8 h-8 flex items-center justify-center">
          <ArrowRight className="w-[18px] h-[18px] text-onWhite2 group-hover:text-onWhite1" />
        </span>
      )}
    </MenuItemWrapper>
  );
});
MenuItem.displayName = "MenuItem";

/**
 * MenuPreviousItem is a UI component that render the previous.
 */
const MenuPreviousItem = memo(function MenuPreviousItem({
  className,
  ...props
}: ComponentProps<"li">) {
  const { navigateBack } = useContext(NavigationContext);
  return (
    <li
      {...props}
      className={cn(
        "h-[42px] w-full px-[14px]",
        "flex items-center",
        "text-left bg-surface1 text-onWhite2",
        className
      )}
    >
      <button
        className="w-8 h-8 flex items-center justify-center hover:text-onWhite1 transition-colors duration-200"
        onClick={navigateBack}
        aria-label="back to previous menu"
      >
        <ArrowRight className="w-[18px] h-[18px] rotate-180" size={18} />
      </button>
    </li>
  );
});
MenuPreviousItem.displayName = "MenuPreviousItem";
