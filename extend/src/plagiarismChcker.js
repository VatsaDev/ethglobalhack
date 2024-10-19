// plagiarismChecker.js

import { pipeline } from '@xenova/transformers';

const clipThresh = 0.7; // Threshold for overall similarity
const ssrchThresh = 0.8; // Threshold for sentence-level similarity

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

function ssrch(short, long) {
  const shortWords = short.toLowerCase().split(/\s+/);
  const longWords = long.toLowerCase().split(/\s+/);
  let matches = 0;
  let skipAllowed = 2;
  let i = 0;

  for (const word of shortWords) {
    while (i < longWords.length) {
      if (word === longWords[i]) {
        matches++;
        i++;
        break;
      } else if (skipAllowed > 0) {
        skipAllowed--;
        i++;
      } else {
        return matches / shortWords.length;
      }
    }
  }
  return matches / shortWords.length;
}

function simpleSentenceSplit(text) {
  return text.split(/(?<=[.!?])\s+/);
}

async function checkPlagiarism(sourceText, textToCheck) {
  await initializeExtractor();

  const clipScore = await clipSim(sourceText, textToCheck);
  const plagiarizedSentences = [];

  if (clipScore > clipThresh) {
    const sentences = simpleSentenceSplit(textToCheck);
    for (const sentence of sentences) {
      const ssrchScore = ssrch(sentence, sourceText);
      if (ssrchScore > ssrchThresh) {
        plagiarizedSentences.push(sentence);
      }
    }
  }

  return plagiarizedSentences;
}

export { checkPlagiarism };

// Usage example:
// import { checkPlagiarism } from './plagiarismChecker.js';
// 
// async function main() {
//   const sourceText = "This is the main text to compare against. It has multiple sentences. We will check for similarity.";
//   const textToCheck = "This is the main text to compare against. It has several sentences. We will look for similarity.";
//   
//   const result = await checkPlagiarism(sourceText, textToCheck);
//   console.log("Plagiarized sentences:", result);
// }
// 
// main().catch(console.error);
