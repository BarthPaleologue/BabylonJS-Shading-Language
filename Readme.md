# BabylonJS Shading Language (BSL)

## What is BSL?

If you want to write custom shaders for BabylonJS, you can either using Material Plugins or Node Materials.
I find Material Plugins very hacky so I prefer Node Materials. However they tend to be a pain to write.

Enter BSL: a single file wrapper around the Node Material API to make it easier to read and write!

Instead of writing this:

```typescript
const albedoTexture = new TextureBlock("albedoTexture");
albedoTexture.target = NodeMaterialBlockTargets.VertexAndFragment;
albedoTexture.convertToLinearSpace = true;
albedoTexture.texture = Textures.CRATE_ALBEDO;

uv.output.connectTo(albedoTexture.uv);
```

write that:

```typescript
const albedoTexture = BSL.sampleTexture(Textures.CRATE_ALBEDO, uv, { convertToLinearSpace: true });
```

Instead of writing this:

```typescript
const meshUVScaleFactor = new InputBlock("Mesh UV scale factor");
meshUVScaleFactor.value = new Vector2(2, 10);

const scaledMeshUV = new MultiplyBlock("scaledMeshUV");

meshUV.output.connectTo(scaledMeshUV.left);
meshUVScaleFactor.output.connectTo(scaledMeshUV.right);
```

Write that:

```typescript
const meshUVScaleFactor = BSL.vecFromBabylon(new Vector2(2, 10));
const scaledMeshUV = BSL.mulVec(meshUV, meshUVScaleFactor);
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
