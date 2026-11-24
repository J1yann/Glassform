# AGENTS.md

Glassform is a source-distributed glass UI library for Svelte 5 and React. The SvelteKit site hosts the docs, playground, and both shadcn registry items. Use [README.md](README.md) for consumer installation examples.

## Work locally

- `bun install` installs dependencies. Use Bun for package management and keep `bun.lock` in sync with intended dependency changes.
- `bun run dev` starts the development server.
- `bun run check` runs Svelte and TypeScript diagnostics.
- `bun run lint` checks formatting and ESLint. Follow [prettier.config.js](prettier.config.js) and format only files you changed.
- `bun run build` writes the static site and prerendered registry JSON to `build/`. Run it after changes to components, routes, or registry entries.

## Find the right code

| Area                                 | Source                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Docs homepage and live examples      | [src/routes/+page.svelte](src/routes/+page.svelte), [src/routes/docs/](src/routes/docs/)                                                   |
| Playground                           | [src/routes/playground/](src/routes/playground/)                                                                                           |
| Svelte components and public exports | [src/lib/glass/](src/lib/glass/), [src/lib/index.ts](src/lib/index.ts)                                                                     |
| React components and stage           | [glassform.tsx](src/lib/glass/glassform.tsx), [lens-stage.tsx](src/lib/glass/lens-stage.tsx)                                               |
| Shared styling, optics, and defaults | [glass.css](src/lib/glass/glass.css), [backdrop-lens.ts](src/lib/glass/backdrop-lens.ts), [lens-profile.ts](src/lib/glass/lens-profile.ts) |
| Source registries                    | [Svelte](src/routes/r/glassform.json/+server.ts), [React](src/routes/r/glassform-react.json/+server.ts)                                    |

## Change components and registries together

- Use Svelte 5 runes for Svelte components and keep shared behavior in framework-neutral TypeScript or CSS where practical.
- Make changes to both framework implementations when a public component behavior applies to both. Preserve existing imports, props, defaults, and native keyboard behavior unless the task changes them.
- A Lens surface on its own blurs the live backdrop through CSS. `LensStage` refracts the supplied photo and discovers Lens surfaces it contains. Preserve the existing rendering fallbacks and reduced-transparency behavior.
- Use the shared renderer and defaults for optical changes that should appear across demos and installed components. Keep pointer-driven lens lighting opt-in through `trackPointer`.
- Each registry ships source files into a consumer project. If you add a file or a runtime import, verify the relevant registry includes the file and that its import paths resolve from the installed directory. Keep the README and live examples aligned when public usage changes.
- For optical changes, check the docs demo and playground with and without a stage as applicable. Verify edges, zero-blur sharpness, and responsive sizing for affected shapes.
