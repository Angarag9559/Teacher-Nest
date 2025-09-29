const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;
const path = "surveys.json"; // adjust if your file is in a folder, e.g., "data/surveys.json"

// Fetch all surveys from GitHub
async function getSurveys() {
  try {
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    let surveys = JSON.parse(Buffer.from(fileData.content, "base64").toString());
    if (!Array.isArray(surveys)) surveys = [];
    return surveys;
  } catch (err) {
    console.error("Error fetching surveys:", err.message);
    return [];
  }
}

// Save a new survey to GitHub
async function saveSurvey(newSurvey) {
  try {
    // Get current file content
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    let surveys = JSON.parse(Buffer.from(fileData.content, "base64").toString());
    if (!Array.isArray(surveys)) surveys = [];
    surveys.push(newSurvey);

    // Update file in GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Add new survey",
      content: Buffer.from(JSON.stringify(surveys, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    return newSurvey;
  } catch (err) {
    console.error("Error saving survey:", err.message);
    throw err;
  }
}

module.exports = { getSurveys, saveSurvey };
