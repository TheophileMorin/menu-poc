/**
 * Recustive structure for defining menu items
 * Items can either have a href or children, but not both
 */
export type MenuItem = {
  label: string;
  href?: string;
  subItems?: MenuItem[];
};
