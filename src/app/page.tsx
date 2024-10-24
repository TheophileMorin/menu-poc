import { MenuItem, NavigationMenu } from "@/components/menu";

const menuContent: MenuItem[] = [
  { label: "designplox", href: "/designplox" },
  {
    label: "artists",
    children: [
      { label: "get your wings", children: [{ label: "idk", href: "/idk" }] },
      {
        label: "hotel california",
        children: [{ label: "idk", href: "/idk" }],
      },
      {
        label: "physical graffiti",
        children: [
          {
            label: "houses of the holy",
            children: [{ label: "idk", href: "/houses-of-the-holy" }],
          },
          { label: "in my time of dying", href: "/in-my-time-of-dying" },
        ],
      },
    ],
  },
  { label: "albums", children: [{ label: "idk", href: "/idk" }] },
  { label: "songs", children: [{ label: "idk", href: "/idk" }] },
  { label: "genres", children: [{ label: "idk", href: "/idk" }] },
  { label: "settings", children: [{ label: "idk", href: "/idk" }] },
];

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col h-full w-full">
        <NavigationMenu content={menuContent} />;
      </main>
    </div>
  );
}
