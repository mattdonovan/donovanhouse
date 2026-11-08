import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera, View } from "@react-three/drei";
import { easing } from "maath";
import { Magazine } from "./Magazine.jsx";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./Book.jsx";
import { useReducedMotion } from "../hooks.js";

const RIFFLE_SPREADS = 3;
const HOLD_MS = 280;
// Each View's render region extends past its card by this much (px), so pages
// turning toward the camera aren't clipped. Must match .mag-view in styles.css.
const BLEED_X = 64;
const BLEED_Y = 80;

// Fit the magazine to the stage (not the bled render region), closed or open.
// Measures the stage element directly: the size drei injects into a View's
// portal is captured once at mount and can be stale or zero.
function FitCamera({ open, stageRef }) {
  const camera = useThree((s) => s.camera);
  useFrame((_, dt) => {
    const el = stageRef.current;
    if (!el || !el.clientWidth || !el.clientHeight) return;
    const innerW = el.clientWidth;
    const innerH = el.clientHeight;
    const fullW = innerW + 2 * BLEED_X;
    const fullH = innerH + 2 * BLEED_Y;
    const halfTan = Math.tan((camera.fov * Math.PI) / 360);
    const needW = (open ? PAGE_WIDTH * 2 : PAGE_WIDTH) * 1.08;
    const needH = PAGE_HEIGHT * 1.1;
    const aspect = fullW / fullH;
    const zH = (needH / 2 / halfTan) * (fullH / innerH);
    const zW = (needW / 2 / (halfTan * aspect)) * (fullW / innerW);
    const z = Math.max(2, zH, zW);
    // Snap on the first frame so the camera never starts inside the book.
    if (camera.position.z <= 0 || !camera.userData.fitted) {
      camera.position.z = z;
      camera.userData.fitted = true;
    }
    easing.damp(camera.position, "z", z, 0.35, dt);
  });
  return null;
}

// Views share one canvas and draw without clearing; overlapping (bled) regions
// would depth-test against a neighbour's scene. Clear depth before each view.
function ClearDepth() {
  return (
    <mesh renderOrder={-1000} frustumCulled={false} onBeforeRender={(gl) => gl.clearDepth()}>
      <planeGeometry args={[0, 0]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

function Tilt({ hovered, children }) {
  const ref = useRef();
  useFrame((_, dt) => {
    easing.dampE(ref.current.rotation, hovered ? [-0.07, -0.1, 0] : [0, 0, 0], 0.3, dt);
    easing.damp3(ref.current.position, hovered ? [0, 0.03, 0.15] : [0, 0, 0], 0.3, dt);
  });
  return <group ref={ref}>{children}</group>;
}

function ShelfItem({ project, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [page, setPage] = useState(0);
  const reduced = useReducedMotion();
  const hasPages = project.spreads.length > 0;
  const cardRef = useRef();
  const pressRef = useRef({ active: false, side: "right", t: 0.5, y: 0 });
  const downAt = useRef(0);

  // Mini flip-through on hover: play up to RIFFLE_SPREADS real spreads, then
  // land on the "Open project" end spread and stay there.
  // Pacing lives in the book's render loop (forwardInterval), so it can't be
  // throttled like a timer. Reduced motion steps through almost instantly.
  const endSpread = Math.min(RIFFLE_SPREADS, project.spreads.length) + 1;
  useEffect(() => {
    setPage(hovered ? endSpread : 0);
  }, [hovered, endSpread]);

  const open = page > 0;

  // Approximate where on the magazine the pointer is, from the card rect.
  const pressAt = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    const rx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ry = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const p = pressRef.current;
    if (open) {
      p.side = rx < 0 ? "left" : "right";
      p.t = Math.min(1, Math.abs(rx) / 0.85);
    } else {
      p.side = "right";
      p.t = Math.min(1, Math.max(0, 0.5 + rx * 0.6));
    }
    p.y = Math.max(-1, Math.min(1, ry));
  };

  useEffect(() => {
    const release = () => {
      pressRef.current.active = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  return (
    <li
      className={`mag-row${hovered ? " is-hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mag-text">
        <p className="eyebrow">
          No. {project.number} · {project.term}
        </p>
        <h2 className="mag-title">{project.title}</h2>
        <p className="mag-course">{project.course}</p>
        <p className="mag-summary">{project.summary ?? "Project pages coming soon."}</p>
        {project.tags?.length > 0 && (
          <ul className="mag-tags">
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <button
          className={`btn ${hasPages ? "btn-navy" : "btn-ghost"} mag-open`}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          onClick={() => onOpen(project.id)}
        >
          {hasPages ? "Open project" : "Preview cover"} <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        ref={cardRef}
        className="mag-stage"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          downAt.current = performance.now();
          pressAt(e);
          pressRef.current.active = true;
        }}
        onPointerMove={(e) => {
          if (pressRef.current.active) pressAt(e);
        }}
      >
        <View className="mag-view" index={hovered ? 2 : 1}>
          <ClearDepth />
          <PerspectiveCamera makeDefault fov={30} position={[0, 0, 6]} />
          <FitCamera open={open} stageRef={cardRef} />
          {/* Lit so a page facing the camera renders at its true color (no tone mapping). */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[1, 2, 6]} intensity={0.45} />
          <Float
            enabled={!reduced}
            speed={1.2}
            rotationIntensity={0}
            floatIntensity={0.25}
            floatingRange={[-0.03, 0.03]}
          >
            <Tilt hovered={hovered}>
              <Suspense fallback={null}>
                <Magazine
                  project={project}
                  quality="sm"
                  maxSpreads={RIFFLE_SPREADS}
                  endCard
                  forwardInterval={reduced ? 0.04 : 0.85}
                  page={page}
                  curve={0.8}
                  pressRef={pressRef}
                  blobShadow
                />
              </Suspense>
            </Tilt>
          </Float>
        </View>
        <button
          className="mag-hit"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(e) => {
            // A long press is for feeling the pages, not opening the project.
            if (e.detail > 0 && performance.now() - downAt.current > HOLD_MS) return;
            onOpen(project.id);
          }}
        />
      </div>
    </li>
  );
}

export function Shelf({ projects, onOpen, paused }) {
  return (
    <>
      <ul className="shelf">
        {projects.map((p) => (
          <ShelfItem key={p.id} project={p} onOpen={onOpen} />
        ))}
      </ul>
      <Canvas
        flat
        className="shelf-canvas"
        frameloop={paused ? "never" : "always"}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      >
        <View.Port />
      </Canvas>
    </>
  );
}
