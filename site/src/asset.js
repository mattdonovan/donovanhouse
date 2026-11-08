// Prefix a public/ path with the deploy base (e.g. "/donovanhouse/" on GitHub Pages).
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
