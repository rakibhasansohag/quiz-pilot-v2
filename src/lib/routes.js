// Define your app's main routes
export const ROUTES = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Quiz", href: "/quiz" },
];

// Simple smart suggestion function
export function pickSuggestions(pathname) {
  if (!pathname) return ROUTES.slice(0, 3);

  // Fallback
  return [ROUTES[1], ROUTES[2], ROUTES[0]];
}
