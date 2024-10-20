let words = null;

// Function to initialize the array of words, in case you want to extend or modify this later
async function initializeWatermarkWords() {
  if (!words) {
    words = ["cherry", "waterfall", "sakana", "blossom", "lotus", "leaf", "fall", "sunshine"];
  }
}

// Function to generate a watermarked version of the text
async function watermark(text) {
  await initializeWatermarkWords();
  
  function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return `§§${words[randomIndex]}§§`;
  }

  function getRandomPosition(textLength) {
    return Math.floor(Math.random() * textLength);
  }

  // Convert the text into an array for easier insertion
  let textArray = text.split("");

  // Insert 10 random watermarks
  for (let i = 0; i < 10; i++) {
    const randomWord = getRandomWord();
    const randomPosition = getRandomPosition(textArray.length);
    
    // Insert the random word at the random position
    textArray.splice(randomPosition, 0, randomWord);
  }

  // Join the array back into a string
  return textArray.join("");
}

export { watermark, initializeWatermarkWords };

