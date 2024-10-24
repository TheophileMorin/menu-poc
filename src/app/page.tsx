import { NavigationMenu } from "@/components/menu/menu";
import type { MenuNodeConfig } from "@/components/menu/menu.models";

const menuConfig: MenuNodeConfig[] = [
  { label: "designplox", href: "/designplox" },
  {
    label: "artists",
    subNodes: [
      { label: "get your wings", subNodes: [{ label: "idk", href: "/idk" }] },
      {
        label: "hotel california",
        subNodes: [
          { label: "idk1", href: "/idk1" },
          { label: "idk2", href: "/idk2" },
          { label: "idk3", href: "/idk3" },
        ],
      },
      {
        label: "physical graffiti",
        subNodes: [
          {
            label: "houses of the holy",
            subNodes: [
              { label: "idk21", href: "/idk21" },
              { label: "idk22", href: "/idk22" },
            ],
          },
          { label: "in my time of dying", href: "/in-my-time-of-dying" },
        ],
      },
    ],
  },
  { label: "albums", subNodes: [{ label: "idk", href: "/idk" }] },
  { label: "songs", subNodes: [{ label: "idk", href: "/idk" }] },
  { label: "genres", subNodes: [{ label: "idk", href: "/idk" }] },
  { label: "settings", subNodes: [{ label: "idk", href: "/idk" }] },
];

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col h-full w-full">
        <NavigationMenu
          config={menuConfig}
          className="max-w-[420px] min-w-[200px]"
        />
      </main>
    </div>
  );
}
