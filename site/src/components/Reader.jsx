import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useProgress } from "@react-three/drei";
import { easing } from "maath";
import { Magazine } from "./Magazine.jsx";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./Book.jsx";
import { useReducedMotion } from "../hooks.js";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const LOUPE_SIZE = 280;
const LOUPE_MIN = 0.4;
const LOUPE_MAX = 2.6;
const HOLD_MS = 280; // a press longer than this is a "hold", not a click
const CURVE_SOFT = 0.45; // default gutter curve in the reader (tutorial = 1)
const CURVE_ZOOMED = 0.2;

// Keep the view over the book at the current zoom.
function clampPan(v) {
  const halfH = (v.fitZ / v.zoom) * v.tanHalf;
  const halfW = halfH * v.aspect;
  const bookHalfW = v.open ? PAGE_WIDTH : PAGE_WIDTH / 2;
  const limX = Math.max(0, bookHalfW + 0.1 - halfW);
  const limY = Math.max(0, PAGE_HEIGHT / 2 + 0.1 - halfH);
  v.x = Math.max(-limX, Math.min(limX, v.x));
  v.y = Math.max(-limY, Math.min(limY, v.y));
}

// Camera that fits the book, then applies zoom + pan from `view` (a mutable ref
// shared with the DOM handlers, so wheel/drag never wait on a React render).
function ReaderRig({ view, open }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useFrame((_, dt) => {
    const v = view.current;
    const aspect = size.width / size.height;
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    const needW = (open ? PAGE_WIDTH * 2 : PAGE_WIDTH) * 1.06;
    const needH = PAGE_HEIGHT * 1.1;
    v.fitZ = Math.max(needH / 2 / tanHalf, needW / 2 / (tanHalf * aspect));
    v.tanHalf = tanHalf;
    v.aspect = aspect;
    v.open = open;
    clampPan(v); // re-clamp when the book opens/closes or the stage resizes
    easing.damp(camera.position, "z", v.fitZ / v.zoom, 0.16, dt);
    easing.damp(camera.position, "x", v.x, 0.16, dt);
    easing.damp(camera.position, "y", v.y, 0.16, dt);
  });
  return null;
}

function Loading() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="reader-loading" role="status">
      Opening project… {Math.round(progress)}%
    </div>
  );
}

function label(page, n) {
  if (page === 0) return "Cover";
  if (page > n) return "Back cover";
  return `Spread ${page} of ${n}`;
}

// Image URL for a texture's source (canvas covers are converted once).
const canvasUrls = new WeakMap();
function sourceUrl(image) {
  if (!image) return null;
  if (image.src) return image.src;
  if (image.toDataURL) {
    if (!canvasUrls.has(image)) canvasUrls.set(image, image.toDataURL("image/jpeg", 0.92));
    return canvasUrls.get(image);
  }
  return null;
}

const SHORTCUTS = [
  ["← →", "Turn the page"],
  ["M", "Magnify — scroll to change power"],
  ["F", "Flatten pages"],
  ["⌘/Ctrl + scroll", "Zoom (or pinch)"],
  ["Drag · scroll", "Pan while zoomed"],
  ["0", "Reset zoom"],
  ["Hold a page", "Press it flat"],
  ["Esc", "Back out / close"],
];

export function Reader({ project, onClose }) {
  const n = project.spreads.length;
  const last = n ? n + 1 : 1;
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(false);
  const [loupeOn, setLoupeOn] = useState(false);
  const [flat, setFlat] = useState(false);
  const [zoomUI, setZoomUI] = useState(1);
  const reduced = useReducedMotion();

  const stageRef = useRef();
  const closeRef = useRef();
  const lensRef = useRef();
  const lensImgRef = useRef();
  const lensBadgeRef = useRef();
  const view = useRef({ zoom: 1, x: 0, y: 0, fitZ: 7, tanHalf: Math.tan(Math.PI / 12), aspect: 1.6, open: false });
  const pressRef = useRef({ active: false, side: "right", t: 0.5, y: 0 });
  const loupe = useRef({ on: false, mag: 0.9, src: null, last: null });
  const gesture = useRef({ downAt: 0, x: 0, y: 0, panning: false, moved: false, pressed: false, ignore: false });

  loupe.current.on = loupeOn;

  const clamp = useCallback((p) => Math.max(0, Math.min(last, p)), [last]);
  const next = useCallback(() => setPage((p) => clamp(p + 1)), [clamp]);
  const prev = useCallback(() => setPage((p) => clamp(p - 1)), [clamp]);

  // ---------- zoom / pan ----------

  const zoomAt = useCallback((factor, clientX, clientY) => {
    const v = view.current;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = clientX ?? rect.left + rect.width / 2;
    const cy = clientY ?? rect.top + rect.height / 2;
    const ndcX = ((cx - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((cy - rect.top) / rect.height) * 2 - 1);
    const half = (z) => (v.fitZ / z) * v.tanHalf;
    // Keep the point under the cursor fixed while zooming.
    const wx = v.x + ndcX * half(v.zoom) * v.aspect;
    const wy = v.y + ndcY * half(v.zoom);
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
    v.zoom = z;
    v.x = wx - ndcX * half(z) * v.aspect;
    v.y = wy - ndcY * half(z);
    if (z === MIN_ZOOM) v.x = v.y = 0;
    clampPan(v);
    setZoomUI(z);
  }, []);

  const panByPixels = (dx, dy) => {
    const v = view.current;
    const rect = stageRef.current.getBoundingClientRect();
    const worldPerPx = (2 * (v.fitZ / v.zoom) * v.tanHalf) / rect.height;
    v.x += dx * worldPerPx;
    v.y -= dy * worldPerPx;
    clampPan(v);
  };

  const resetZoom = useCallback(() => {
    Object.assign(view.current, { zoom: 1, x: 0, y: 0 });
    setZoomUI(1);
  }, []);

  // ---------- loupe ----------
  const updateLensPosition = (clientX, clientY) => {
    const rect = stageRef.current.getBoundingClientRect();
    const x = clientX - rect.left - LOUPE_SIZE / 2;
    const y = clientY - rect.top - LOUPE_SIZE / 2;
    lensRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const paintLens = () => {
    const l = loupe.current.last;
    const img = lensImgRef.current;
    if (!l) {
      img.style.opacity = "0";
      return;
    }
    const m = loupe.current.mag;
    if (loupe.current.src !== l.src) {
      img.style.backgroundImage = `url("${l.src}")`;
      loupe.current.src = l.src;
    }
    img.style.opacity = "1";
    // Real magnification relative to how big the image currently is on screen.
    lensBadgeRef.current.textContent = `${((l.w * m) / l.screenW).toFixed(1)}×`;
    img.style.backgroundSize = `${l.w * m}px ${l.h * m}px`;
    img.style.backgroundPosition = `${LOUPE_SIZE / 2 - l.x * m}px ${LOUPE_SIZE / 2 - l.y * m}px`;
  };

  // ---------- page pointer events (from the 3D pages) ----------
  const onPagePointer = useCallback(
    (type, e) => {
      const native = e.nativeEvent;
      if (type === "leave") {
        if (loupe.current.on) {
          loupe.current.last = null;
          paintLens();
        }
        return;
      }
      const mi = e.face?.materialIndex;
      const isFace = mi === 4 || mi === 5;
      const uv = e.uv;
      if (!isFace || !uv) {
        if (type === "move" && loupe.current.on) {
          loupe.current.last = null;
          paintLens();
        }
        return;
      }
      const front = mi === 4;
      const side = front ? "right" : "left";
      const t = front ? uv.x : 1 - uv.x; // distance from the spine, 0..1
      const yNorm = uv.y * 2 - 1;

      if (type === "down") {
        const zoomedPan = view.current.zoom > 1.001 && !loupe.current.on;
        if (!zoomedPan) {
          Object.assign(pressRef.current, { active: true, side, t, y: yNorm });
          gesture.current.pressed = true;
        }
      } else if (type === "move" && pressRef.current.active && pressRef.current.side === side) {
        pressRef.current.t = t;
        pressRef.current.y = yNorm;
      }

      if (loupe.current.on) {
        const tex = e.object.material[mi]?.map;
        const image = tex?.image;
        const src = sourceUrl(image);
        if (src) {
          const w = image.naturalWidth || image.width;
          const h = image.naturalHeight || image.height;
          const v = view.current;
          const stageW = stageRef.current.clientWidth;
          const halfW = (v.fitZ / v.zoom) * v.tanHalf * v.aspect;
          const pagePx = (stageW * PAGE_WIDTH) / (2 * halfW);
          loupe.current.last = {
            screenW: pagePx / tex.repeat.x,
            src,
            w,
            h,
            x: (tex.offset.x + uv.x * tex.repeat.x) * w,
            y: (1 - (tex.offset.y + uv.y * tex.repeat.y)) * h,
          };
          updateLensPosition(native.clientX, native.clientY);
          paintLens();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onPageClick = useCallback(
    (p) => {
      const g = gesture.current;
      if (loupe.current.on || g.moved || performance.now() - g.downAt > HOLD_MS) return;
      setPage(clamp(p));
    },
    [clamp]
  );

  // ---------- stage DOM gestures ----------
  // Capture phase: runs before R3F's listener on the canvas, so a page's
  // onPagePointer("down") can set g.pressed after this reset, not before it.
  const onPointerDownCapture = (e) => {
    const g = gesture.current;
    g.ignore = e.button !== 0 || !!e.target.closest("button, .stage-tools");
    g.downAt = performance.now();
    g.x = e.clientX;
    g.y = e.clientY;
    g.moved = false;
    g.pressed = false;
    g.panning = !g.ignore && view.current.zoom > 1.001 && !loupe.current.on;
    if (g.panning) {
      stageRef.current.classList.add("is-panning");
      stageRef.current.setPointerCapture?.(e.pointerId);
    }
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (loupe.current.on) updateLensPosition(e.clientX, e.clientY);
    if (!(e.buttons & 1) || g.ignore) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.hypot(dx, dy) > 4) g.moved = true;
    if (g.panning) {
      panByPixels(-(e.movementX || 0), -(e.movementY || 0));
    }
  };
  const endPan = () => {
    gesture.current.panning = false;
    stageRef.current?.classList.remove("is-panning");
  };
  const onPointerUp = (e) => {
    const g = gesture.current;
    const wasPanning = g.panning;
    endPan();
    if (g.ignore || wasPanning || loupe.current.on) return;
    // A hold on a page is a press, not a swipe.
    if (g.pressed && performance.now() - g.downAt > HOLD_MS) return;
    const dx = e.clientX - g.x;
    if (Math.abs(dx) > 45 && performance.now() - g.downAt < 600) {
      g.moved = true;
      dx < 0 ? next() : prev();
    }
  };

  // Release a press anywhere (pointer may leave the page while held).
  useEffect(() => {
    const release = () => {
      pressRef.current.active = false;
      endPan(); // pointer may be released outside the stage
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  // Wheel: ⌘/Ctrl/Alt (and trackpad pinch, which sets ctrlKey) zooms; with the
  // loupe on, plain scroll changes loupe power; when zoomed, plain scroll pans.
  useEffect(() => {
    const el = stageRef.current;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        const pinch = e.ctrlKey && Math.abs(e.deltaY) < 40;
        zoomAt(Math.exp(-e.deltaY * (pinch ? 0.012 : 0.0022)), e.clientX, e.clientY);
      } else if (loupe.current.on) {
        e.preventDefault();
        const m = loupe.current.mag * Math.exp(-e.deltaY * 0.0018);
        loupe.current.mag = Math.max(LOUPE_MIN, Math.min(LOUPE_MAX, m));
        paintLens();
      } else if (view.current.zoom > 1.001) {
        e.preventDefault();
        panByPixels(e.deltaX, e.deltaY);
      }
    };
    // Safari reports trackpad pinch as gesture events, not ctrl+wheel.
    let lastScale = 1;
    const onGestureStart = (e) => {
      e.preventDefault();
      lastScale = 1;
    };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.scale / lastScale, e.clientX, e.clientY);
      lastScale = e.scale;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGestureStart, { passive: false });
    el.addEventListener("gesturechange", onGestureChange, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", onGestureStart);
      el.removeEventListener("gesturechange", onGestureChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomAt]);

  // Open the cover shortly after the reader appears.
  useEffect(() => {
    closeRef.current?.focus();
    if (!n) return;
    const t = setTimeout(() => setPage((p) => (p === 0 ? 1 : p)), 650);
    return () => clearTimeout(t);
  }, [n]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // leave browser shortcuts alone
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key;
      if (k === "Escape") {
        if (modal) setModal(false);
        else if (loupe.current.on) setLoupeOn(false);
        else if (view.current.zoom > 1.001) resetZoom();
        else onClose();
        return;
      }
      if (modal) return;
      if (k === "ArrowRight") next();
      else if (k === "ArrowLeft") prev();
      else if (k === "m" || k === "M") setLoupeOn((v) => !v);
      else if (k === "f" || k === "F") setFlat((v) => !v);
      else if (k === "=" || k === "+") zoomAt(1.25);
      else if (k === "-" || k === "_") zoomAt(0.8);
      else if (k === "0") resetZoom();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, next, prev, onClose, zoomAt, resetZoom]);

  // Lock page scroll while open (on <html> too: it has overflow-x: clip), and
  // return focus to whatever opened the reader when it closes.
  useEffect(() => {
    const opener = document.activeElement;
    const html = document.documentElement;
    const prev = [document.body.style.overflow, html.style.overflow];
    document.body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      [document.body.style.overflow, html.style.overflow] = prev;
      document.body.style.cursor = "";
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  // A page turn changes what's under the lens; clear it until the next move.
  useEffect(() => {
    if (!loupe.current.on) return;
    loupe.current.last = null;
    paintLens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Loupe on/off housekeeping.
  useEffect(() => {
    if (!loupeOn) {
      loupe.current.last = null;
      loupe.current.src = null;
      if (lensImgRef.current) lensImgRef.current.style.backgroundImage = "";
    } else {
      paintLens();
    }
    document.body.style.cursor = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loupeOn]);

  const spread = page >= 1 && page <= n ? page : null;
  const caption = spread ? project.captions?.[spread - 1] : null;
  const open = spread !== null;
  const zoomed = zoomUI > 1.001;
  const inspecting = zoomed || loupeOn;
  const curve = flat ? 0 : zoomed ? CURVE_ZOOMED : CURVE_SOFT;

  return (
    <div className="reader" role="dialog" aria-modal="true" aria-label={project.title}>
      <header className="reader-top">
        <div>
          <p className="eyebrow">
            No. {project.number} · {project.course} · {project.term}
          </p>
          <h2 className="reader-title">{project.title}</h2>
        </div>
        <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close project">
          ×
        </button>
      </header>

      <div className="reader-body">
        <div
          ref={stageRef}
          className={`reader-stage${loupeOn ? " loupe-on" : ""}${zoomed ? " is-zoomed" : ""}`}
          onPointerDownCapture={onPointerDownCapture}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endPan}
          onPointerLeave={() => {
            if (loupe.current.on) {
              loupe.current.last = null;
              paintLens();
            }
          }}
        >
          <Canvas flat shadows dpr={[1, 2]} camera={{ fov: 30, position: [0, 0, 7] }}>
            <ReaderRig view={view} open={open} />
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[-0.6, 1.2, 6]}
              intensity={0.45}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0004}
              shadow-camera-left={-3}
              shadow-camera-right={3}
              shadow-camera-top={3}
              shadow-camera-bottom={-3}
            />
            <mesh position-z={-0.12} receiveShadow>
              <planeGeometry args={[30, 30]} />
              <shadowMaterial opacity={0.13} />
            </mesh>
            <Float
              enabled={!reduced && !inspecting}
              speed={1}
              rotationIntensity={0.12}
              floatIntensity={0.25}
              floatingRange={[-0.02, 0.02]}
            >
              <group rotation-x={-0.05}>
                <Suspense fallback={null}>
                  <Magazine
                    project={project}
                    quality="lg"
                    page={page}
                    interactive
                    highlight={!loupeOn}
                    curve={curve}
                    pressRef={pressRef}
                    onPageClick={onPageClick}
                    onPagePointer={onPagePointer}
                  />
                </Suspense>
              </group>
            </Float>
          </Canvas>

          <Loading />

          <div className="stage-tools" role="toolbar" aria-label="Viewing tools">
            <button
              className={`tool${loupeOn ? " on" : ""}`}
              onClick={() => setLoupeOn((v) => !v)}
              aria-pressed={loupeOn}
              title="Magnify (M) — scroll to change power"
            >
              Magnify <kbd>M</kbd>
            </button>
            <button
              className={`tool${flat ? " on" : ""}`}
              onClick={() => setFlat((v) => !v)}
              aria-pressed={flat}
              title="Flatten pages (F)"
            >
              Flatten <kbd>F</kbd>
            </button>
            <span className="tool-group" aria-label="Zoom">
              <button className="tool" onClick={() => zoomAt(0.8)} aria-label="Zoom out" disabled={!zoomed}>
                −
              </button>
              <button className="tool tool-readout" onClick={resetZoom} title="Reset zoom (0)">
                {Math.round(zoomUI * 100)}%
              </button>
              <button className="tool" onClick={() => zoomAt(1.25)} aria-label="Zoom in" disabled={zoomUI >= MAX_ZOOM}>
                +
              </button>
            </span>
          </div>

          <div ref={lensRef} className={`loupe${loupeOn ? " visible" : ""}`} aria-hidden="true">
            <div ref={lensImgRef} className="loupe-img" />
            <span ref={lensBadgeRef} className="loupe-badge" />
          </div>

          <button className="stage-arrow left" onClick={prev} disabled={page === 0} aria-label="Previous page">
            ‹
          </button>
          <button className="stage-arrow right" onClick={next} disabled={page === last} aria-label="Next page">
            ›
          </button>
        </div>

        <aside className="reader-notes">
          <p className="eyebrow" aria-live="polite">
            {label(page, n)}
          </p>
          {caption ? (
            <>
              <h3>{caption.heading}</h3>
              <p>{caption.body}</p>
            </>
          ) : page === 0 ? (
            <p>{project.summary ?? "Project pages coming soon."}</p>
          ) : (
            <p>Thanks for reading.</p>
          )}
          <div className="notes-actions">
            {spread && (
              <button className="btn btn-navy" onClick={() => setModal(true)}>
                View full size
              </button>
            )}
            {project.pdf && (
              <a className="btn btn-ghost" href={project.pdf} target="_blank" rel="noreferrer">
                Original PDF
              </a>
            )}
          </div>
          <dl className="shortcuts">
            {SHORTCUTS.map(([k, d]) => (
              <div key={k}>
                <dt>
                  <kbd>{k}</kbd>
                </dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {n > 0 && (
        <nav className="reader-thumbs" aria-label="Spreads">
          <button className={`thumb text${page === 0 ? " active" : ""}`} onClick={() => setPage(0)}>
            Cover
          </button>
          {project.spreads.map((s, i) => (
            <button
              key={s.sm}
              className={`thumb${page === i + 1 ? " active" : ""}`}
              onClick={() => setPage(i + 1)}
              aria-label={`Spread ${i + 1}${project.captions?.[i] ? `: ${project.captions[i].heading}` : ""}`}
            >
              <img src={s.sm} alt="" loading="lazy" />
            </button>
          ))}
          <button className={`thumb text${page === last ? " active" : ""}`} onClick={() => setPage(last)}>
            Back
          </button>
        </nav>
      )}

      {modal && spread && (
        <div className="lightbox" onClick={() => setModal(false)} role="dialog" aria-label="Full size spread">
          <img
            src={project.spreads[spread - 1].lg}
            alt={caption ? `${caption.heading} — ${project.title}` : project.title}
          />
          <button className="icon-btn lightbox-close" aria-label="Close full size view">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
