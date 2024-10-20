<script>
  import { onMount } from "svelte";
  import { collection, getDocs, doc, getDoc } from "firebase/firestore";
  import { db } from "../../firebase";
  import { geminiInference } from "../../geminiInference";

  let assignment = "";
  let steps = [];
  let agents = [];
  let thoughts = [];
  let finalAnswer = "";
  let fileSystem = "";
  let inferenceResults = [];
  let processing = false;

  async function processAssignment() {
    processing = true;
    inferenceResults = [];
    thoughts = [];
    steps = [];
    finalAnswer = "";
    fileSystem = "";

    try {
      addThought("grey", "Starting assignment processing");

      // Break down assignment into steps
      addThought("blue", "Breaking down assignment into technical steps");
      const breakdown = await geminiInference(
        `Break down this assignment into detailed steps, focusing on specific technologies where applicable: ${assignment}`
      );
      steps = breakdown.split("\n").filter((step) => step.trim() !== "");
      addThought("blue", "Assignment broken down into technical steps");

      // Fetch agent types from Firebase
      addThought("blue", "Fetching agent types from Firebase");
      const agentsSnapshot = await getDocs(collection(db, "users"));
      agents = agentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      addThought("blue", "Agent types fetched from Firebase");

      // Process each step sequentially
      for (const [index, step] of steps.entries()) {
        addThought("grey", `Processing step ${index + 1}: ${step}`);
        const relevantAgents = agents.filter((agent) =>
          step.toLowerCase().includes(agent.purposeTag.toLowerCase())
        );

        let stepResult;
        if (relevantAgents.length > 0) {
          const agent = relevantAgents[0]; // Use the first matching agent
          addThought(
            "red",
            `Using specialized agent ${agent.purposeTag} for step ${index + 1}`
          );
          stepResult = await callAgent(agent, step);
        } else {
          addThought("blue", `Using general processing for step ${index + 1}`);
          stepResult = await geminiInference(
            `Complete this step with detailed technical implementation: ${step}`
          );
        }

        inferenceResults = [...inferenceResults, stepResult];
        addThought("blue", `Completed processing for step ${index + 1}`);
      }

      // Merge and optimize results
      addThought(
        "blue",
        "Merging and optimizing code with technological focus"
      );
      finalAnswer = await geminiInference(
        `Merge and optimize the following results, providing detailed code with specific technology implementations:\n${inferenceResults.join("\n\n")}`
      );
      addThought("blue", "Code merged and optimized");

      // Generate detailed file system diagram and code structure
      addThought(
        "blue",
        "Generating detailed file system diagram and code structure"
      );
      const fileSystemPrompt = `
        Generate a detailed file system diagram and code structure for: ${assignment}
        Include specific file names, technologies used, and brief descriptions of each file's purpose.
        Format the output as a tree structure with markdown code blocks for file contents where appropriate.
      `;
      fileSystem = await geminiInference(fileSystemPrompt);
      addThought("blue", "File system diagram and code structure generated");

      addThought("grey", "Assignment processing completed");
    } catch (error) {
      addThought("red", `Error occurred: ${error.message}`);
    } finally {
      processing = false;
    }
  }

  function addThought(color, thought) {
    thoughts = [...thoughts, { color, content: thought }];
  }

  async function callAgent(agent, task) {
    const prompt = `As an agent specialized in ${agent.purposeTag}, complete this task with detailed technical implementation: ${task}\n\nAgent's key takeaway: ${agent.takeaway}`;
    return await geminiInference(prompt);
  }

  function formatInferenceResult(result) {
    return result.replace(/\n/g, "<br>");
  }
</script>

<main>
  <h1>Detailed Assignment Processor</h1>

  <input
    bind:value={assignment}
    placeholder="Enter your one-liner assignment"
    disabled={processing}
  />
  <button on:click={processAssignment} disabled={processing}>
    {processing ? "Processing..." : "Process Assignment"}
  </button>

  {#if steps.length > 0}
    <h2>Technical Steps:</h2>
    <ol>
      {#each steps as step}
        <li>{step}</li>
      {/each}
    </ol>
  {/if}

  <h2>Processing Thoughts:</h2>
  <ul>
    {#each thoughts as thought}
      <li style="color: {thought.color};">{thought.content}</li>
    {/each}
  </ul>

  {#if inferenceResults.length > 0}
    <h2>Detailed Inference Results:</h2>
    {#each inferenceResults as result, index}
      <div class="inference-result">
        <h3>Result for Step {index + 1}</h3>
        {@html formatInferenceResult(result)}
      </div>
    {/each}
  {/if}

  {#if finalAnswer}
    <h2>Final Detailed Implementation:</h2>
    <pre><code>{finalAnswer}</code></pre>
  {/if}

  {#if fileSystem}
    <h2>Detailed File System Diagram and Code Structure:</h2>
    <pre><code>{fileSystem}</code></pre>
  {/if}
</main>

<style>
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    font-size: 16px;
  }
  button {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  ul,
  ol {
    padding-left: 20px;
  }
  pre {
    background-color: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 14px;
  }
  code {
    font-family: "Courier New", Courier, monospace;
  }
  .inference-result {
    margin-bottom: 20px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
  }
</style>
