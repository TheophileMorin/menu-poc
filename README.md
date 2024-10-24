# Tech Test

The `src/app/page.tsx` initialize a JSON object with a menu configuration
The menu component is in `src/components/menu/menu.tsx` alongs with

- Models definition
- A Zod validator (for objects runtime validation)
- A context provider.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Additional infos

This test is based on a NextJs project for convinience.
The project uses :

- lucide-react: for icons
- tailwind: css framework
- clsx & tailwind-merge : to merge tailwind classes
- zod: for object runtime validation
