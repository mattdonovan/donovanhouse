import { asset } from "../asset.js";

// Every project is a "magazine". Each spread is one 16:9 image that is split
// across the left and right pages when the magazine is open.
//
// To add a project:
//   1. Export the presentation as 16:9 images (or PDF -> images) into
//      public/projects/<id>/spread-01.jpg, spread-02.jpg ... (~2048px wide)
//      plus a small copy spread-01-sm.jpg ... (~1024px wide) for the shelf.
//   2. Add an entry below. `captions` is the design-reasoning text shown beside
//      each spread in the reader (one entry per spread).
//
// Caption text marked DRAFT was written from the slides for the prototype —
// Kristin should replace it with her own explanation of each design choice.

const spreadUrls = (id, count) =>
  Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      lg: asset(`projects/${id}/spread-${n}.jpg`),
      sm: asset(`projects/${id}/spread-${n}-sm.jpg`),
    };
  });

export const projects = [
  {
    id: "lowes-primary-bath",
    title: "The Lowe's Primary Bath",
    shortTitle: "Lowe's Primary Bath",
    course: "ITMD 235 · Kitchen & Bath",
    term: "Spring 2026",
    number: "01",
    cover: { src: asset("/projects/lowes-primary-bath/spread-01-sm.jpg"), crop: [0.02, 0, 0.47, 0.6] },
    spreads: spreadUrls("lowes-primary-bath", 12),
    pdf: asset("/projects/lowes-primary-bath/lowes-primary-bath.pdf"),
    summary:
      "A primary bath remodel designed as a calm, restorative retreat with the feel of an upscale spa — double vanity with a makeup station, a marble-wrapped walk-in shower, and a plan checked against all 27 NKBA bath guidelines.",
    tags: ["Cyncly 2020 Design", "Floor plan + elevation", "Material board", "Renderings"],
    captions: [
      {
        heading: "The concept",
        body: "DRAFT — A primary bath remodel for the Lowe family: double vanity with a seated makeup station, a walk-in shower wrapped in Calacatta Verde marble, and a tray ceiling with a drum chandelier.",
      },
      {
        heading: "Color palette",
        body: "The primary bath is designed as a calm, restorative retreat with the feel of an upscale spa. A palette of warm greys and soft neutral whites is complemented by subtle green- and blue-grey undertones, creating a serene and timeless atmosphere. Alabaster accents and a thoughtful mix of polished and brushed nickel add depth, sophistication, and a refined touch of luxury.",
      },
      {
        heading: "Materials & finishes",
        body: "DRAFT — Calacatta Verde 12×24 honed marble on the vanity accent wall and shower, matching 1\" penny round on the shower floor and niche, 24×48 matte porcelain floors, and Beige Travertine solid surface counters with integrated sinks. Walls in SW 9166 Drift of Mist; ceiling plane in SW 7657 Tinsmith.",
      },
      {
        heading: "Floor plan",
        body: "DRAFT — Dimensioned floor plan drawn in Cyncly. The double vanity runs the long wall, with the shower and toilet compartment grouped on the opposite end.",
      },
      {
        heading: "Vanity elevation",
        body: "DRAFT — A 155⅞\" vanity wall with sink centerlines 81\" apart, 36\" counter height, and a lowered makeup station between the two lavatories.",
      },
      {
        heading: "NKBA guidelines 1–12",
        body: "DRAFT — The plan was checked against all 27 NKBA bath planning guidelines: door clearances, ceiling heights, clear floor space, lavatory spacing and heights, shower size, control placement, and shower seat dimensions.",
      },
      {
        heading: "NKBA guidelines 13–21",
        body: "DRAFT — Waterproof surrounds, grab-bar blocking, tempered glazing, outward-swinging shower door, slip-resistant flooring, and toilet clearances. Note on Guideline 21: the inward door swing into the toilet compartment was original to the space and was not changed.",
      },
      {
        heading: "NKBA guidelines 22–27",
        body: "DRAFT — Storage at point of use, accessory placement, GFCI receptacles, layered general and task lighting, mechanical ventilation, and a supplemental heat source.",
      },
      {
        heading: "Vanity & shower entry",
        body: "DRAFT — Renderings looking across the vanity toward the entry, and into the walk-in shower.",
      },
      {
        heading: "Double vanity",
        body: "DRAFT — Full-height linen towers frame the mirrors; toe-kick lighting floats the cabinetry and doubles as a night light.",
      },
      {
        heading: "The shower",
        body: "DRAFT — A walk-in shower with a fixed glass panel, rain head plus hand shower, and grab bars that coordinate with the brushed nickel fixtures.",
      },
      {
        heading: "Thank you",
        body: "Questions about this project? Reach out at donovanhouse@outlook.com.",
      },
    ],
  },
  {
    id: "coastal-style",
    title: "Coastal Style Concept Board",
    shortTitle: "Coastal Style",
    course: "History of Interior Design II",
    term: "Fall 2024",
    number: "02",
    cover: { src: asset("/projects/coastal-style/full-01.jpg"), crop: [0.58, 0.55, 0.42, 0.45] },
    spreads: [{ lg: asset("/projects/coastal-style/spread-01.jpg"), sm: asset("/projects/coastal-style/spread-01-sm.jpg") }],
    summary: "A concept board tracing the materials, palettes and furniture of American coastal style, from Northeast shingle to Southern pastels.",
    tags: ["Concept board", "Design history", "Color palettes"],
    captions: [
      {
        heading: "Coastal style",
        body: "DRAFT — Exterior and interior elements, accessories, flooring, textiles, furniture and five regional coastal palettes.",
      },
    ],
  },
  {
    id: "cad-kitchen",
    title: "CAD: Kitchen Design",
    shortTitle: "CAD Kitchen",
    course: "DRAF 264 · CAD: Interior Design",
    term: "Spring 2024",
    number: "03",
    cover: { src: asset("/projects/cad-kitchen/spread-02-sm.jpg"), crop: [0.69, 0.06, 0.26, 0.42] },
    spreads: [
      { lg: asset("/projects/cad-kitchen/spread-01.jpg"), sm: asset("/projects/cad-kitchen/spread-01-sm.jpg") },
      { lg: asset("/projects/cad-kitchen/spread-02.jpg"), sm: asset("/projects/cad-kitchen/spread-02-sm.jpg") },
    ],
    summary: "A kitchen drawn in AutoCAD: finish schedule, product selections, floor plan and two elevations on a single 24×36 sheet.",
    tags: ["AutoCAD", "Finish schedule", "Elevations"],
    captions: [
      { heading: "The sheet", body: "DRAFT — Finishes schedule, selections, floor plan and elevations on one 24×36 sheet." },
      { heading: "Elevations", body: "DRAFT — Elevations 2 and 3 with tile and countertop keynotes." },
    ],
  },
  // Placeholders: the Canva embeds in the source folder didn't export.
  // Add spreads + captions when the files are available.
  { id: "nkba-standards", title: "NKBA Standards", course: "Kitchen & Bath", term: "Spring 2026", number: "04", spreads: [], summary: "Project pages coming soon." },
  { id: "design-flex", title: "Design Flex / 2020", course: "Kitchen & Bath", term: "Spring 2026", number: "05", spreads: [], summary: "Project pages coming soon." },
  { id: "chief-architect-id3", title: "Chief Architect", course: "Interior Design III", term: "Fall 2025", number: "06", spreads: [], summary: "Project pages coming soon." },
  { id: "environmental-systems", title: "Environmental Systems", course: "Environmental Systems for the Interior Designer", term: "Spring 2025", number: "07", spreads: [], summary: "Project pages coming soon." },
  { id: "chief-architect-sw1", title: "Chief Architect", course: "Interior Design Software I", term: "Spring 2024", number: "08", spreads: [], summary: "Project pages coming soon." },
  { id: "policies-procedures", title: "Policies & Procedures", course: "Policies and Procedures", term: "Fall 2024", number: "09", spreads: [], summary: "Project pages coming soon." },
];

export const contact = {
  email: "donovanhouse@outlook.com",
  website: "www.donovanhouse.com",
};
