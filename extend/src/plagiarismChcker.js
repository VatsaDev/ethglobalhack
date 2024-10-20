import { pipeline } from '@xenova/transformers';

let extractor;

async function initializeExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
}

async function clipSim(text1, text2) {
  const [e1, e2] = await Promise.all([
    extractor(text1, { pooling: 'mean', normalize: true }),
    extractor(text2, { pooling: 'mean', normalize: true })
  ]);
  
  return e1.data.reduce((sum, val, i) => sum + val * e2.data[i], 0);
}

async function checkSimilarity(sourceText, textToCheck) {
  await initializeExtractor();
  const similarityScore = await clipSim(sourceText, textToCheck);
  return similarityScore;
}

export { checkSimilarity };
