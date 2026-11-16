/**
 * True if the specified file name has one of the allowed extensions
 * (case-insensitive).
 *
 * @param fileName The file name.
 * @param allowedExtensions The allowed extensions, without the dot.
 */
export function hasAllowedExtension(
  fileName: string,
  allowedExtensions: string[],
): boolean {
  const i = fileName.lastIndexOf('.');
  if (i < 0) {
    return false;
  }
  const extension = fileName.substring(i + 1).toLowerCase();
  return allowedExtensions.some((e) => e.toLowerCase() === extension);
}
