import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { suspend } from "suspend-react";
import { SRGBColorSpace } from "three";
import { Book } from "./Book.jsx";
import { makeBackCoverTexture, makeCoverTexture, makeEndCardTexture } from "./covers.js";

function half(tex, side) {
  const t = tex.clone(); // shares the image source, so the GPU upload is shared too
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(0.5, 1);
  t.offset.set(side === "left" ? 0 : 0.5, 0);
  t.needsUpdate = true;
  return t;
}

// Cover, then one sheet per spread boundary, then back cover:
//   sheet 0      front = cover,            back = left half of spread 1
//   sheet k      front = right of spread k, back = left half of spread k+1
//   sheet N      front = right of spread N, back = back cover
// endCard: append a final "Open project" spread (used by the shelf flip-through).
export function useSheets(project, quality = "lg", maxSpreads = Infinity, endCard = false) {
  const spreads = project.spreads.slice(0, maxSpreads);
  const urls = spreads.map((s) => s[quality]);
  // useTexture needs at least one url; a 1px data uri keeps hook order stable.
  const loaded = useTexture(urls.length ? urls : [BLANK]);
  const cover = suspend(() => makeCoverTexture(project), ["cover", project.id]);
  const back = suspend(() => makeBackCoverTexture(), ["back-cover"]);
  const end = suspend(() => (endCard ? makeEndCardTexture(project) : Promise.resolve(null)), ["end", project.id, endCard]);

  const sheets = useMemo(() => {
    const tex = [...(urls.length ? loaded : []), ...(end ? [end] : [])];
    const halves = tex.map((t) => ({ left: half(t, "left"), right: half(t, "right") }));
    if (!halves.length) return [{ front: cover, back }];
    const out = [{ front: cover, back: halves[0].left }];
    for (let k = 1; k < halves.length; k++) out.push({ front: halves[k - 1].right, back: halves[k].left });
    out.push({ front: halves[halves.length - 1].right, back });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, cover, back, end]);

  useEffect(
    () => () => {
      sheets.forEach((s) => {
        // Clones only; the cached cover/back/end textures are shared.
        if (s.front !== cover) s.front.dispose?.();
        if (s.back !== back) s.back.dispose?.();
      });
    },
    [sheets, cover, back]
  );

  return sheets;
}

const BLANK =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export function Magazine({ project, quality, maxSpreads, endCard, page, ...props }) {
  const sheets = useSheets(project, quality, maxSpreads, endCard);
  return <Book sheets={sheets} page={Math.min(page, sheets.length)} {...props} />;
}
