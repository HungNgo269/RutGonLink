export const DEFAULT_API_GLOBAL_PREFIX = 'v1/app';
export const SWAGGER_DOCUMENT_PATH = 'docs';

export function getApiGlobalPrefix(): string {
  return normalizePathPrefix(
    process.env.API_GLOBAL_PREFIX ?? DEFAULT_API_GLOBAL_PREFIX,
  );
}

export function buildPrefixedPath(path: string): string {
  const apiPrefix = getApiGlobalPrefix();
  const normalizedPath = normalizePathPrefix(path);

  return normalizedPath ? `${apiPrefix}/${normalizedPath}` : apiPrefix;
}

function normalizePathPrefix(prefix: string): string {
  return prefix.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}
