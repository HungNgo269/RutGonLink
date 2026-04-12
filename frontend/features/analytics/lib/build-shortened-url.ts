export function buildShortenedUrl(baseUrl: string, shortCode: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${shortCode.replace(/^\//, "")}`;
}
