// Picking one item at random, kept out of components so render code stays
// pure. Used for "You could take: {reward}" after a good focus block.
export function pickOne<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}
