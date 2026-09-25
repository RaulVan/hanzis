export const MAX_STARS = 3;

/** Each hint costs one star and every three mistakes cost one star; a finished round keeps at least one. */
export function getGameStars(mistakes: number, hints: number): number {
  return Math.max(1, MAX_STARS - hints - Math.floor(mistakes / 3));
}
