export const chooseWeightedRandom = <T>(items: T[], weights: number[]): T => {
  if (!items.length || items.length !== weights.length) {
    throw new Error('Invalid weighted random input');
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
  let threshold = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
};
