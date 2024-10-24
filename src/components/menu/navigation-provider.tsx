import { MenuNodeConfig } from "@/components/menu/menu.models";
import { createContext, ReactElement, useMemo } from "react";

type NavigationContextType = {
  navigate: (node: MenuNodeConfig) => void;
  navigateBack: () => void;
};

export const NavigationContext = createContext<NavigationContextType>({
  get navigate(): never {
    throw new Error("navigate is not implemented");
  },
  get navigateBack(): never {
    throw new Error("navigate is not implemented");
  },
});

// Navigate & NavigateBack must me provided with useCallbacks
export const NavigationProvider = ({
  children,
  navigate,
  navigateBack,
}: React.PropsWithChildren &
  NavigationContextType): ReactElement<NavigationContextType> => {
  const value = useMemo(
    () => ({ navigate, navigateBack }),
    [navigate, navigateBack]
  );
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
NavigationProvider.displayName = "NavigationProvider";
