// Skinned-mesh page-turning book, adapted from Wawa Sensei's
// "3D Book Slider" tutorial (https://www.youtube.com/watch?v=b7a_Y1Ja6js).
//
// Each sheet is a thin BoxGeometry with 30 width segments and a chain of bones;
// rotating the bones with eased curves gives the inside curve, outside curve,
// turning curl and fold of a real page.
//
// Additions over the tutorial:
//  - `curve` (0..1): how much of the gutter curve to keep. 1 = tutorial look,
//    0 = pages hinge flat at the spine. Curvature that is removed is moved onto
//    the hinge bone, so the far edge of the page keeps the same angle.
//  - `pressRef`: { active, side: 'left' | 'right', t: 0..1 from spine, y }.
//    While active, pages on that side flatten around `t` with a spring, and the
//    whole book is pushed in slightly.
//  - `blobShadow`: a soft fake shadow behind the book (cheap; for the shelf).

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  Bone,
  BoxGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Sphere,
  Uint16BufferAttribute,
  Vector3,
} from "three";

// One page = half of a 16:9 slide -> 8:9.
export const PAGE_ASPECT = 8 / 9;
export const PAGE_HEIGHT = 1.6;
export const PAGE_WIDTH = PAGE_HEIGHT * PAGE_ASPECT;
const PAGE_DEPTH = 0.004;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
const BONE_COUNT = PAGE_SEGMENTS + 1;

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.16;
const outsideCurveStrength = 0.04;
const turningCurveStrength = 0.09;

// Press spring: slightly under-damped so a release has a small settle.
const PRESS_STIFFNESS = 170;
const PRESS_DAMPING = 15;
const PRESS_SIGMA = 7; // bones
const MAX_DT = 1 / 30;

// Resting curvature per bone (multiplied by the page's target rotation).
const BASE_CURVE = Array.from({ length: BONE_COUNT }, (_, i) => {
  const inside = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
  const outside = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
  return insideCurveStrength * inside - outsideCurveStrength * outside;
});

const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);
{
  const position = pageGeometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes = [];
  const skinWeights = [];
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    // Clamp so the far edge references bones 29/30, not a non-existent bone 31.
    const skinIndex = Math.min(PAGE_SEGMENTS - 1, Math.max(0, Math.floor(x / SEGMENT_WIDTH)));
    const skinWeight = MathUtils.clamp((x - skinIndex * SEGMENT_WIDTH) / SEGMENT_WIDTH, 0, 1);
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }
  pageGeometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
  pageGeometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
}

// SkinnedMesh caches its bounding sphere from the first pose it sees, so raycasts
// against a turned page can miss. This sphere (around the spine) covers every pose.
const PAGE_BOUNDS = new Sphere(new Vector3(0, 0, 0), Math.hypot(PAGE_WIDTH, PAGE_HEIGHT / 2) * 1.1);

// Paper is mostly self-lit: the page image is also its emissive map at
// SELF_LIT, and scene lights add the rest plus curvature shading. A page facing
// the camera shows its true colors instead of a grey, lit-plastic cast.
const SELF_LIT = 0.75;
const paperEdge = new Color("#e6e1d8");
const edge = (color) => new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: SELF_LIT });
const edgeMaterials = [edge(paperEdge), edge(new Color("#2a2f38")), edge(paperEdge), edge(paperEdge)];

function stepSpring(state, target, dt) {
  const a = PRESS_STIFFNESS * (target - state.x) - PRESS_DAMPING * state.v;
  state.v += a * dt;
  state.x += state.v * dt;
}

function Page({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  isCover,
  isBack,
  interactive,
  highlight,
  curve,
  pressRef,
  onPageClick,
  onPagePointer,
}) {
  const group = useRef();
  const meshRef = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const curveNow = useRef({ v: curve });
  const press = useRef({ x: 0, v: 0, t: 0.5 });
  const angles = useRef(new Float32Array(BONE_COUNT));
  const posed = useRef(false); // snap to the target pose on the first frame

  const mesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i < BONE_COUNT; i++) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);
    const face = (map, glossy) =>
      new MeshStandardMaterial({
        color: "white",
        map,
        emissive: "white",
        emissiveMap: map,
        emissiveIntensity: SELF_LIT,
        roughness: glossy ? 0.7 : 0.9,
      });
    const materials = [...edgeMaterials, face(front, isCover), face(back, isBack)];
    const m = new SkinnedMesh(pageGeometry, materials);
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.boundingSphere = PAGE_BOUNDS.clone();
    m.add(skeleton.bones[0]);
    m.bind(skeleton);
    return m;
  }, [front, back, isCover, isBack]);

  useEffect(
    () => () => {
      mesh.material[4].dispose();
      mesh.material[5].dispose();
      mesh.skeleton.dispose();
    },
    [mesh]
  );

  useFrame((_, rawDelta) => {
    const m = meshRef.current;
    if (!m) return;
    const delta = Math.min(rawDelta, MAX_DT);


    if (lastOpened.current !== opened) {
      turnedAt.current = performance.now();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, performance.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) targetRotation += MathUtils.degToRad(number * 0.8);

    // Ease the curve amount so toggling "flatten" animates.
    easing.damp(curveNow.current, "v", curve, 0.25, delta);

    // Press spring for this page: only pages on the pressed side respond.
    const p = pressRef?.current;
    const onPressedSide = !!p?.active && (opened ? p.side === "left" : p.side === "right");
    if (onPressedSide) press.current.t = p.t;
    stepSpring(press.current, onPressedSide ? 1 : 0, delta);
    const s = press.current.x;
    const center = press.current.t * PAGE_SEGMENTS;

    const bones = m.skeleton.bones;
    const a = angles.current;
    let moved = 0;
    for (let i = 0; i < BONE_COUNT; i++) {
      const w = Math.exp(-((i - center) ** 2) / (2 * PRESS_SIGMA * PRESS_SIGMA));
      // Overshoot of the spring can push kappa a little negative: a tiny rebound.
      const kappa = Math.max(-0.15, curveNow.current.v * (1 - s * (0.35 + 0.65 * w)));
      a[i] = kappa * BASE_CURVE[i] * targetRotation;
      moved += (1 - kappa) * BASE_CURVE[i] * targetRotation;
    }
    a[0] += moved;

    for (let i = 0; i < BONE_COUNT; i++) {
      const target = i === 0 ? group.current : bones[i];
      const turningIntensity = Math.sin(i * Math.PI * (1 / BONE_COUNT)) * turningTime;
      let rotationAngle = a[i] + turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = MathUtils.degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        rotationAngle = i === 0 ? targetRotation : 0;
        foldRotationAngle = 0;
      }
      // Plain damp, not dampAngle: these are absolute angles, and shortest-path
      // wrapping can send the hinge the wrong way when the target nears ±π.
      if (!posed.current) target.rotation.y = rotationAngle;
      else easing.damp(target.rotation, "y", rotationAngle, easingFactor, delta);
      const foldIntensity =
        i > 8 ? Math.sin(i * Math.PI * (1 / BONE_COUNT) - 0.5) * turningTime * (1 - Math.min(1, s)) : 0;
      easing.dampAngle(target.rotation, "x", foldRotationAngle * foldIntensity, easingFactorFold, delta);
    }
    posed.current = true;
  });

  const handlers = interactive
    ? {
        onPointerEnter: (e) => {
          e.stopPropagation();
          if (highlight) document.body.style.cursor = "pointer";
        },
        onPointerLeave: (e) => {
          e.stopPropagation();
          document.body.style.cursor = "";
          onPagePointer?.("leave", e, { number, opened });
        },
        onPointerMove: (e) => {
          e.stopPropagation();
          onPagePointer?.("move", e, { number, opened });
        },
        onPointerDown: (e) => {
          e.stopPropagation();
          onPagePointer?.("down", e, { number, opened });
        },
        onClick: (e) => {
          e.stopPropagation();
          onPageClick?.(opened ? number : number + 1);
        },
      }
    : {};

  return (
    <group ref={group} {...handlers}>
      <primitive object={mesh} ref={meshRef} position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH} />
    </group>
  );
}

// Steps one page at a time toward `page` so jumping several pages riffles.
// Driven by the render loop (not setTimeout) so it stays in sync with frames.
// `forwardInterval` (seconds) slows forward steps, e.g. for a hover preview.
function useDelayedPage(page, forwardInterval) {
  const [delayedPage, setDelayedPage] = useState(page);
  const current = useRef(page);
  const wait = useRef(0);
  useFrame((_, delta) => {
    if (current.current === page) return;
    wait.current -= delta;
    if (wait.current > 0) return;
    const forward = page > current.current;
    current.current += forward ? 1 : -1;
    setDelayedPage(current.current);
    wait.current =
      forward && forwardInterval ? forwardInterval : Math.abs(page - current.current) > 2 ? 0.05 : 0.15;
  });
  return delayedPage;
}

let shadowTexture;
function getShadowTexture() {
  if (shadowTexture) return shadowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  // Keep the blurred rect well inside the canvas so the plane's edges are fully transparent.
  ctx.filter = "blur(12px)";
  ctx.fillStyle = "rgba(20,26,35,1)";
  ctx.fillRect(38, 38, 52, 52);
  shadowTexture = new CanvasTexture(c);
  return shadowTexture;
}

// Soft rectangle behind the visible extent of the book.
function BlobShadow({ closedFront, closedBack }) {
  const ref = useRef();
  const ext = useRef({ l: 0, r: PAGE_WIDTH });
  const tex = useMemo(getShadowTexture, []);
  useFrame((_, dt) => {
    easing.damp(ext.current, "l", closedFront ? 0 : -PAGE_WIDTH, 0.3, dt);
    easing.damp(ext.current, "r", closedBack ? 0 : PAGE_WIDTH, 0.3, dt);
    const { l, r } = ext.current;
    ref.current.position.x = (l + r) / 2 + 0.05;
    ref.current.scale.set((r - l) * 1.55, PAGE_HEIGHT * 1.45, 1);
  });
  return (
    <mesh ref={ref} position={[0.05, -0.05, -0.1]} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent opacity={0.13} depthWrite={false} />
    </mesh>
  );
}

/**
 * sheets: [{ front: Texture, back: Texture }]
 * page:   0 = closed on the cover, sheets.length = closed on the back cover.
 * The book recenters itself so a closed cover sits in the middle of the frame.
 */
export function Book({
  sheets,
  page,
  interactive = false,
  highlight = true,
  curve = 1,
  pressRef,
  blobShadow = false,
  forwardInterval,
  onPageClick,
  onPagePointer,
  ...props
}) {
  const delayedPage = useDelayedPage(page, forwardInterval);
  const center = useRef();
  const push = useRef();
  const pushSpring = useRef({ x: 0, v: 0 });
  const closedFront = delayedPage === 0;
  const closedBack = delayedPage === sheets.length;

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DT);
    const x = closedFront ? -PAGE_WIDTH / 2 : closedBack ? PAGE_WIDTH / 2 : 0;
    easing.damp(center.current.position, "x", x, 0.35, delta);

    // Whole-book push-in while pressed (springy).
    const p = pressRef?.current;
    stepSpring(pushSpring.current, p?.active ? 1 : 0, delta);
    const s = pushSpring.current.x;
    const dir = p ? (p.side === "left" ? -1 : 1) * (0.3 + 0.7 * (p.t ?? 0.5)) : 0;
    push.current.position.z = -0.045 * s;
    push.current.rotation.y = 0.035 * s * dir;
    push.current.rotation.x = -0.025 * s * (p?.y ?? 0);
  });

  return (
    <group {...props}>
      <group ref={push}>
        <group ref={center} position-x={-PAGE_WIDTH / 2}>
          {blobShadow && <BlobShadow closedFront={closedFront} closedBack={closedBack} />}
          <group rotation-y={-Math.PI / 2}>
            {sheets.map((s, index) => (
              <Page
                key={index}
                number={index}
                front={s.front}
                back={s.back}
                page={delayedPage}
                opened={delayedPage > index}
                bookClosed={closedFront || closedBack}
                isCover={index === 0}
                isBack={index === sheets.length - 1}
                interactive={interactive}
                highlight={highlight}
                curve={curve}
                pressRef={pressRef}
                onPageClick={onPageClick}
                onPagePointer={onPagePointer}
              />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
