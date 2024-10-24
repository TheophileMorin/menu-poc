import { NavigationMenu } from "@/components/menu/menu";
import type { MenuItem } from "@/components/menu/menu.models";

const menuContent: MenuItem[] = [
  { label: "designplox", href: "/designplox" },
  {
    label: "artists",
    subItems: [
      { label: "get your wings", subItems: [{ label: "idk", href: "/idk" }] },
      {
        label: "hotel california",
        subItems: [{ label: "idk", href: "/idk" }],
      },
      {
        label: "physical graffiti",
        subItems: [
          {
            label: "houses of the holy",
            subItems: [{ label: "idk", href: "/houses-of-the-holy" }],
          },
          { label: "in my time of dying", href: "/in-my-time-of-dying" },
        ],
      },
    ],
  },
  { label: "albums", subItems: [{ label: "idk", href: "/idk" }] },
  { label: "songs", subItems: [{ label: "idk", href: "/idk" }] },
  { label: "genres", subItems: [{ label: "idk", href: "/idk" }] },
  { label: "settings", subItems: [{ label: "idk", href: "/idk" }] },
];

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col h-full w-full">
        <NavigationMenu content={menuContent} />
      </main>
    </div>
  );
}
