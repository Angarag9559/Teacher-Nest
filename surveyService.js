const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;
const path = "surveys.json"; // adjust if in a folder

// Fetch all surveys from GitHub
async function getSurveys() {
  try {
    console.log("DEBUG: Fetching surveys from GitHub");
    console.log(`Owner: ${owner}, Repo: ${repo}, Path: ${path}`);

    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    let surveys = JSON.parse(Buffer.from(fileData.content, "base64").toString());
    if (!Array.isArray(surveys)) surveys = [];
    console.log(`DEBUG: Found ${surveys.length} survey(s)`);
    return surveys;
  } catch (err) {
    console.error("ERROR: Fetching surveys failed:", err.message);
    return [];
  }
}

// Save a new survey to GitHub
async function saveSurvey(newSurvey) {
  try {
    console.log("DEBUG: Saving new survey to GitHub");
    console.log("Survey content:", newSurvey);

    // Get current file content
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    let surveys = JSON.parse(Buffer.from(fileData.content, "base64").toString());
    if (!Array.isArray(surveys)) surveys = [];
    surveys.push(newSurvey);

    console.log(`DEBUG: Total surveys after adding: ${surveys.length}`);

    // Update the file in GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Add new survey",
      content: Buffer.from(JSON.stringify(surveys, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    console.log("DEBUG: Survey saved successfully!");
    return newSurvey;
  } catch (err) {
    console.error("ERROR: Saving survey failed:", err.message);
    throw err;
  }
}

module.exports = { getSurveys, saveSurvey };
