/**
 * Recustive structure for defining menu items
 * Items can either have a href or children, but not both
 */
export type MenuNodeConfig = {
  label: string;
  href?: string;
  subNodes?: MenuNodeConfig[];
};
