# BabylonJS Shading Language (BSL)

## What is BSL?

If you want to write custom shaders for BabylonJS, you can either using Material Plugins or Node Materials.
I find Material Plugins very hacky so I prefer Node Materials. However they tend to be a pain to write.

Enter BSL: a thin wrapper around the Node Material API to make it easier to read and write!

Instead of writing this:

```typescript
const uv = new InputBlock("uv");
uv.setAsAttribute("uv");

const albedoTexture = new TextureBlock("albedoTexture");
albedoTexture.target = NodeMaterialBlockTargets.Fragment;
albedoTexture.convertToLinearSpace = true;
albedoTexture.texture = Textures.CRATE_ALBEDO;

uv.output.connectTo(albedoTexture.uv);
```

write that:

```typescript
const uv = BSL.vertexAttribute("uv");
const albedoTexture = BSL.textureSample(Textures.CRATE_ALBEDO, uv, { convertToLinearSpace: true });
```

As you can see the BSL version is much more glsl-like and easier to read and reason about.

Instead of writing this:

```typescript
const factor = new InputBlock("Mesh UV scale factor");
factor.value = new Vector2(2, 10);

const scaledUV = new MultiplyBlock("scaledMeshUV");

uv.output.connectTo(scaledUV.left);
factor.output.connectTo(scaledUV.right);
```

Write that:

```typescript
const factor = BSL.vec(new Vector2(2, 10));
const scaledUV = BSL.mul(uv, factor);
```

## How to use BSL?

The wrapper in self-contained in a single file, so you can either copy paste it in your code base or install it as a package:

```bash
npm install babylonjs-shading-language
```

Then, import it in your code:

```typescript
import * as BSL from "babylonjs-shading-language";
```

You can find the documentation of the latest version [here](https://barthpaleologue.github.io/BabylonJS-Shading-Language/).

For specific versions, you can build the documentation locally with `npm run docs` and open the `docs/index.html` file in your browser.

## Missing features

I only wrapped the features that I need for my own projects, you may need to use the raw API for more advanced features.
Don't worry you can use both at the same time!

I am always open to PRs to add more features to BSL so that we eventually reach feature parity with the raw API.
