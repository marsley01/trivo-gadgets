export function extractProductId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/-p-([A-Za-z0-9]+)\.html/);
  if (urlMatch) return urlMatch[1];

  const idMatch = trimmed.match(/^[A-Za-z0-9]+$/);
  if (idMatch) return idMatch[0];

  return null;
}
