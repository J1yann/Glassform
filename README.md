# Glassform

[![Registry downloads, last 30 days](https://img.shields.io/endpoint?url=https%3A%2F%2Fglassform.jiyan.space%2Fapi%2Fdownloads-badge)](https://glassform.jiyan.space/#installation)

Glassform is a glass UI component library for **Svelte 5 and React**. Both versions share the same glass styles and photo-backed refraction renderer.

[Documentation](https://glassform.jiyan.space/) · [Playground](https://glassform.jiyan.space/playground)

## Status

**About 50% complete.** The core surfaces, Everyday UI controls, and photo-backed `LensStage` are available in both frameworks. Reusable overlays, navigation, and feedback components are still planned.

## Installation

Run the command for your framework from a project configured with the corresponding shadcn CLI. The registry installs source files under your configured components directory. Glassform uses plain CSS at runtime.

### Svelte

```bash
bunx shadcn-svelte@1.8.1 add https://glassform.jiyan.space/r/glassform.json
```

```svelte
<script lang="ts">
  import GlassPanel from '$lib/components/glassform/GlassPanel.svelte';
  import LensStage from '$lib/components/glassform/LensStage.svelte';
</script>

<LensStage photo={{ src: '/images/backdrop.webp' }}>
  <GlassPanel material="lens">Your content</GlassPanel>
</LensStage>
```

### React

```bash
bunx shadcn@latest add https://glassform.jiyan.space/r/glassform-react.json
```

```tsx
import { GlassPanel, LensStage } from "@/components/glassform/glassform";

export function Preview() {
  return (
    <LensStage photo={{ src: "/images/backdrop.webp" }}>
      <GlassPanel material="lens">Your content</GlassPanel>
    </LensStage>
  );
}
```

Adjust the imports if your project's components alias is different.

## Blur and refraction

Use a Lens surface on its own for translucent glass that blurs the **live page behind it**. This works without an image and suits overlays such as sidebars.

Use `LensStage` for glass that **refracts a backdrop image**. Replace the example path with an image served by your app. One stage can serve multiple Lens surfaces, and unsupported rendering paths fall back to SVG refraction where available or CSS blur. The WebGL renderer samples the supplied image.

## Development

```bash
bun install
bun run dev
bun run check
bun run build
```

`bun run deploy` builds and publishes the site and both registries to Cloudflare Pages. It requires Wrangler access to the Glassform Pages project.
