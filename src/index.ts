// MIT License
//
// Copyright (c) 2025 Barthélemy Paléologue
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { TextureBlock } from "@babylonjs/core/Materials/Node/Blocks/Dual/textureBlock";
import { FragmentOutputBlock } from "@babylonjs/core/Materials/Node/Blocks/Fragment/fragmentOutputBlock";
import { PerturbNormalBlock } from "@babylonjs/core/Materials/Node/Blocks/Fragment/perturbNormalBlock";
import { InputBlock } from "@babylonjs/core/Materials/Node/Blocks/Input/inputBlock";
import { MultiplyBlock } from "@babylonjs/core/Materials/Node/Blocks/multiplyBlock";
import { PBRMetallicRoughnessBlock } from "@babylonjs/core/Materials/Node/Blocks/PBR/pbrMetallicRoughnessBlock";
import { ScaleBlock } from "@babylonjs/core/Materials/Node/Blocks/scaleBlock";
import { TransformBlock } from "@babylonjs/core/Materials/Node/Blocks/transformBlock";
import {
    TrigonometryBlock,
    TrigonometryBlockOperations
} from "@babylonjs/core/Materials/Node/Blocks/trigonometryBlock";
import { VectorMergerBlock } from "@babylonjs/core/Materials/Node/Blocks/vectorMergerBlock";
import { VectorSplitterBlock } from "@babylonjs/core/Materials/Node/Blocks/vectorSplitterBlock";
import { VertexOutputBlock } from "@babylonjs/core/Materials/Node/Blocks/Vertex/vertexOutputBlock";
import { NodeMaterialBlockTargets } from "@babylonjs/core/Materials/Node/Enums/nodeMaterialBlockTargets";
import { NodeMaterialSystemValues } from "@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues";
import { NodeMaterialConnectionPoint } from "@babylonjs/core/Materials/Node/nodeMaterialBlockConnectionPoint";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector2, Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";

export const Stage = {
    VERT: NodeMaterialBlockTargets.Vertex,
    FRAG: NodeMaterialBlockTargets.Fragment,
    VERT_AND_FRAG: NodeMaterialBlockTargets.VertexAndFragment,
    NEUTRAL: NodeMaterialBlockTargets.Neutral
} as const;

/**
 * Returns the camera position as a uniform input block.
 */
export function uniformCameraPosition(): NodeMaterialConnectionPoint {
    const cameraPosition = new InputBlock("cameraPosition");
    cameraPosition.target = NodeMaterialBlockTargets.VertexAndFragment;
    cameraPosition.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);

    return cameraPosition.output;
}

/**
 * Returns the view matrix as a uniform input block.
 */
export function uniformView(): NodeMaterialConnectionPoint {
    const view = new InputBlock("view");
    view.target = NodeMaterialBlockTargets.VertexAndFragment;
    view.setAsSystemValue(NodeMaterialSystemValues.View);

    return view.output;
}

/**
 * Returns the view projection matrix as a uniform input block.
 */
export function uniformViewProjection(): NodeMaterialConnectionPoint {
    const ViewProjection = new InputBlock("ViewProjection");
    ViewProjection.target = NodeMaterialBlockTargets.VertexAndFragment;
    ViewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

    return ViewProjection.output;
}

/**
 * Returns the world matrix as a uniform input block.
 */
export function uniformWorld(): NodeMaterialConnectionPoint {
    const world = new InputBlock("world");
    world.target = NodeMaterialBlockTargets.VertexAndFragment;
    world.setAsSystemValue(NodeMaterialSystemValues.World);

    return world.output;
}

/**
 * Returns a vertex attribute input block for the given attribute name.
 * @param name - The name of the vertex attribute.
 */
export function vertexAttribute(name: string): NodeMaterialConnectionPoint {
    const position = new InputBlock(name);
    position.target = NodeMaterialBlockTargets.Vertex;
    position.setAsAttribute(name);

    return position.output;
}

/**
 * Returns a float input block with the given value.
 * @param value - The float value.
 */
export function float(value: number): NodeMaterialConnectionPoint {
    const inputBlock = new InputBlock("float");
    inputBlock.target = Stage.VERT_AND_FRAG;
    inputBlock.value = value;

    return inputBlock.output;
}

/**
 * Returns a constant float input block with the given name and value.
 * @param name - The name of the input block.
 * @param value - The float value.
 */
export function constFloat(name: string, value: number): NodeMaterialConnectionPoint {
    const inputBlock = new InputBlock(name);
    inputBlock.target = Stage.VERT_AND_FRAG;
    inputBlock.value = value;
    inputBlock.isConstant = true;

    return inputBlock.output;
}

/**
 * Returns a uniform float input block with the given name and value.
 * @param name - The name of the input block.
 * @param value - The float value.
 */
export function uniformFloat(name: string, value: number): NodeMaterialConnectionPoint {
    const inputBlock = new InputBlock(name);
    inputBlock.target = Stage.VERT_AND_FRAG;
    inputBlock.value = value;
    inputBlock.matrixMode = 0;

    return inputBlock.output;
}

export type TextureBlockProps = {
    convertToLinearSpace: boolean;
    convertToGammaSpace: boolean;
    disableLevelMultiplication: boolean;
};

/**
 * Samples a texture using the given UV coordinates and optional properties.
 * @param texture - The texture to sample.
 * @param uv - The UV coordinates.
 * @param props - Optional properties for the texture block.
 */
export function sampleTexture(texture: Texture, uv: NodeMaterialConnectionPoint, props?: Partial<TextureBlockProps>) {
    const textureBlock = new TextureBlock("texture");
    textureBlock.target = NodeMaterialBlockTargets.VertexAndFragment;
    textureBlock.convertToGammaSpace = props?.convertToGammaSpace ?? false;
    textureBlock.convertToLinearSpace = props?.convertToLinearSpace ?? false;
    textureBlock.disableLevelMultiplication = props?.disableLevelMultiplication ?? false;
    textureBlock.texture = texture;

    uv.connectTo(textureBlock.uv);

    return textureBlock;
}

/**
 * Transforms a position vector using the given transformation matrix.
 * @param transformMat4 - The transformation matrix.
 * @param positionVec3 - The position vector.
 * @param stage - The target stage.
 */
export function transformPosition(
    transformMat4: NodeMaterialConnectionPoint,
    positionVec3: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const transformBlock = new TransformBlock("TransformPosition");
    transformBlock.target = stage;
    transformBlock.complementZ = 0;
    transformBlock.complementW = 1;

    positionVec3.connectTo(transformBlock.vector);
    transformMat4.connectTo(transformBlock.transform);

    return transformBlock.output;
}

/**
 * Transforms a direction vector using the given transformation matrix.
 * @param transformMat4 - The transformation matrix.
 * @param directionVec3 - The direction vector.
 * @param stage - The target stage.
 */
export function transformDirection(
    transformMat4: NodeMaterialConnectionPoint,
    directionVec3: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const transformBlock = new TransformBlock("TransformDirection");
    transformBlock.target = stage;
    transformBlock.complementZ = 0;
    transformBlock.complementW = 0;

    directionVec3.connectTo(transformBlock.vector);
    transformMat4.connectTo(transformBlock.transform);

    return transformBlock.output;
}

/**
 * Returns the fractional part of the input value.
 * @param input - The input value.
 * @param stage - The target stage.
 */
export function fract(
    input: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const fractBlock = new TrigonometryBlock("fract");
    fractBlock.operation = TrigonometryBlockOperations.Fract;
    fractBlock.target = stage;

    input.connectTo(fractBlock.input);

    return fractBlock.output;
}

/**
 * Multiplies the input value by the given factor.
 * @param input - The input value.
 * @param factor - The multiplication factor.
 * @param stage - The target stage.
 */
export function mul(
    input: NodeMaterialConnectionPoint,
    factor: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const scaleBlock = new ScaleBlock("Position to UV scale");
    scaleBlock.target = stage;

    input.connectTo(scaleBlock.input);
    factor.connectTo(scaleBlock.factor);

    return scaleBlock.output;
}

/**
 * Multiplies two vectors.
 * @param left - The left vector.
 * @param right - The right vector.
 * @param stage - The target stage.
 */
export function mulVec(
    left: NodeMaterialConnectionPoint,
    right: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const multBlock = new MultiplyBlock("scaledMeshUV");
    multBlock.target = stage;

    left.connectTo(multBlock.left);
    right.connectTo(multBlock.right);

    return multBlock.output;
}

/**
 * Merges the given components into a vector.
 * @param x - The x component.
 * @param y - The y component.
 * @param z - The z component (optional).
 * @param w - The w component (optional).
 * @param stage - The target stage.
 */
export function merge(
    x: NodeMaterialConnectionPoint,
    y: NodeMaterialConnectionPoint,
    z: NodeMaterialConnectionPoint | null,
    w: NodeMaterialConnectionPoint | null,
    stage: NodeMaterialBlockTargets
) {
    const merger = new VectorMergerBlock("Merge");
    merger.target = stage;

    x.connectTo(merger.x);
    y.connectTo(merger.y);

    if (z) {
        z.connectTo(merger.z);
    }

    if (w) {
        w.connectTo(merger.w);
    }

    return merger;
}

/**
 * Converts a Babylon.js vector to a node material input block.
 * @param vec - The Babylon.js vector.
 */
export function vecFromBabylon(vec: Vector2 | Vector3 | Vector4) {
    const meshUVScaleFactor = new InputBlock("Mesh UV scale factor");
    meshUVScaleFactor.isConstant = true;
    meshUVScaleFactor.value = vec;

    return meshUVScaleFactor.output;
}

/**
 * Creates a vec2 from the given components.
 * @param x - The x component.
 * @param y - The y component.
 * @param stage - The target stage.
 */
export function vec2(
    x: NodeMaterialConnectionPoint,
    y: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    return merge(x, y, null, null, stage).xyOut;
}

/**
 * Creates a vec3 from the given components.
 * @param x - The x component.
 * @param y - The y component.
 * @param z - The z component.
 * @param stage - The target stage.
 */
export function vec3(
    x: NodeMaterialConnectionPoint,
    y: NodeMaterialConnectionPoint,
    z: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    return merge(x, y, z, null, stage).xyzOut;
}

/**
 * Creates a vec4 from the given components.
 * @param x - The x component.
 * @param y - The y component.
 * @param z - The z component.
 * @param w - The w component.
 * @param stage - The target stage.
 */
export function vec4(
    x: NodeMaterialConnectionPoint,
    y: NodeMaterialConnectionPoint,
    z: NodeMaterialConnectionPoint,
    w: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    return merge(x, y, z, w, stage).xyzw;
}

/**
 * Splits a vec2 into its components.
 * @param inputVec2 - The input vec2.
 * @param stage - The target stage.
 */
export function splitVec2(
    inputVec2: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): VectorSplitterBlock {
    const splitBlock = new VectorSplitterBlock("splitVec2");
    splitBlock.target = stage;

    inputVec2.connectTo(splitBlock.xyIn);

    return splitBlock;
}

/**
 * Splits a vec3 into its components.
 * @param inputVec3 - The input vec3.
 * @param stage - The target stage.
 */
export function splitVec3(
    inputVec3: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): VectorSplitterBlock {
    const splitBlock = new VectorSplitterBlock("splitVec3");
    splitBlock.target = stage;

    inputVec3.connectTo(splitBlock.xyzIn);

    return splitBlock;
}

/**
 * Returns the xy components of a vec3.
 * @param inputVec3 - The input vec3.
 * @param stage - The target stage.
 */
export function xy(
    inputVec3: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const inputSplitted = splitVec3(inputVec3, stage);
    return inputSplitted.xyOut;
}

/**
 * Returns the xz components of a vec3.
 * @param inputVec3 - The input vec3.
 * @param stage - The target stage.
 */
export function xz(
    inputVec3: NodeMaterialConnectionPoint,
    stage: NodeMaterialBlockTargets
): NodeMaterialConnectionPoint {
    const inputSplitted = splitVec3(inputVec3, stage);

    const outputXZ = new VectorMergerBlock("OutputXZ");
    outputXZ.target = stage;

    inputSplitted.x.connectTo(outputXZ.x);
    inputSplitted.z.connectTo(outputXZ.y);

    return outputXZ.xyOut;
}

/**
 * Perturbs the normal vector using the given parameters.
 * @param uv - The UV coordinates.
 * @param positionWorldVec3 - The world position vector.
 * @param normalWorldVec3 - The world normal vector.
 * @param normalTexture - The normal texture.
 * @param bumpStrengthFloat - The bump strength.
 */
export function perturbNormal(
    uv: NodeMaterialConnectionPoint,
    positionWorldVec3: NodeMaterialConnectionPoint,
    normalWorldVec3: NodeMaterialConnectionPoint,
    normalTexture: NodeMaterialConnectionPoint,
    bumpStrengthFloat: NodeMaterialConnectionPoint
): NodeMaterialConnectionPoint {
    const Perturbnormal = new PerturbNormalBlock("Perturb normal");
    Perturbnormal.target = NodeMaterialBlockTargets.Fragment;

    uv.connectTo(Perturbnormal.uv);
    positionWorldVec3.connectTo(Perturbnormal.worldPosition);
    normalWorldVec3.connectTo(Perturbnormal.worldNormal);
    normalTexture.connectTo(Perturbnormal.normalMapColor);
    bumpStrengthFloat.connectTo(Perturbnormal.strength);

    return Perturbnormal.output;
}

/**
 * Creates a PBR metallic roughness material using the given parameters.
 * @param albedoRgb - The albedo color.
 * @param metallicFloat - The metallic value.
 * @param roughnessFloat - The roughness value.
 * @param ambientOcclusionFloat - The ambient occlusion value (optional).
 * @param perturbedNormalVec3 - The perturbed normal vector.
 * @param normalWorldVec3 - The world normal vector.
 * @param viewMat4 - The view matrix.
 * @param cameraPositionVec3 - The camera position vector.
 * @param positionWorldVec3 - The world position vector.
 */
export function pbrMetallicRoughnessMaterial(
    albedoRgb: NodeMaterialConnectionPoint,
    metallicFloat: NodeMaterialConnectionPoint,
    roughnessFloat: NodeMaterialConnectionPoint,
    ambientOcclusionFloat: NodeMaterialConnectionPoint | null,
    perturbedNormalVec3: NodeMaterialConnectionPoint,
    normalWorldVec3: NodeMaterialConnectionPoint,
    viewMat4: NodeMaterialConnectionPoint,
    cameraPositionVec3: NodeMaterialConnectionPoint,
    positionWorldVec3: NodeMaterialConnectionPoint
): NodeMaterialConnectionPoint {
    const PBRMetallicRoughness = new PBRMetallicRoughnessBlock("PBRMetallicRoughness");
    PBRMetallicRoughness.target = NodeMaterialBlockTargets.Fragment;
    PBRMetallicRoughness.useEnergyConservation = true;
    PBRMetallicRoughness.useRadianceOcclusion = true;
    PBRMetallicRoughness.useHorizonOcclusion = true;

    albedoRgb.connectTo(PBRMetallicRoughness.baseColor);
    metallicFloat.connectTo(PBRMetallicRoughness.metallic);
    roughnessFloat.connectTo(PBRMetallicRoughness.roughness);
    ambientOcclusionFloat?.connectTo(PBRMetallicRoughness.ambientOcc);
    perturbedNormalVec3.connectTo(PBRMetallicRoughness.perturbedNormal);
    normalWorldVec3.connectTo(PBRMetallicRoughness.worldNormal);
    viewMat4.connectTo(PBRMetallicRoughness.view);
    cameraPositionVec3.connectTo(PBRMetallicRoughness.cameraPosition);
    positionWorldVec3.connectTo(PBRMetallicRoughness.worldPosition);

    return PBRMetallicRoughness.lighting;
}

export type OutputFragColorProps = {
    convertToLinearSpace: boolean;
    convertToGammaSpace: boolean;
};

/**
 * Outputs the fragment color using the given parameters.
 * @param colorRgb - The color.
 * @param props - Optional properties for the fragment output block.
 */
export function outputFragColor(
    colorRgb: NodeMaterialConnectionPoint,
    props?: OutputFragColorProps
): FragmentOutputBlock {
    const FragmentOutput = new FragmentOutputBlock("FragmentOutput");
    FragmentOutput.target = NodeMaterialBlockTargets.Fragment;
    FragmentOutput.convertToGammaSpace = props?.convertToGammaSpace ?? false;
    FragmentOutput.convertToLinearSpace = props?.convertToLinearSpace ?? false;

    colorRgb.connectTo(FragmentOutput.rgb);

    return FragmentOutput;
}

/**
 * Outputs the vertex position using the given parameters.
 * @param positionVec4 - The position vector.
 */
export function outputVertexPosition(positionVec4: NodeMaterialConnectionPoint): VertexOutputBlock {
    const VertexOutput = new VertexOutputBlock("VertexOutput");
    VertexOutput.target = NodeMaterialBlockTargets.Vertex;

    positionVec4.connectTo(VertexOutput.vector);

    return VertexOutput;
}
