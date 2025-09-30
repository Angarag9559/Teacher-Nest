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
// surveyService.js
async function saveSurvey(newSurvey) {
  try {
    console.log("DEBUG: Saving new survey to GitHub");
    console.log("Survey content:", newSurvey);

    // Helper to fetch current surveys + sha
    const fetchFile = async () => {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      const surveys = JSON.parse(Buffer.from(fileData.content, "base64").toString() || "[]");
      return { surveys: Array.isArray(surveys) ? surveys : [], sha: fileData.sha };
    };

    // First fetch
    let { surveys, sha } = await fetchFile();
    surveys.push(newSurvey);

    const content = Buffer.from(JSON.stringify(surveys, null, 2)).toString("base64");

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: "Add new survey",
        content,
        sha,
      });
      console.log("DEBUG: Survey saved successfully!");
      return newSurvey;
    } catch (err) {
      if (err.status === 409) {
        console.warn("WARN: Conflict detected, refetching file...");
        // Fetch again to get new sha and append again
        let { surveys: freshSurveys, sha: freshSha } = await fetchFile();
        freshSurveys.push(newSurvey);

        const freshContent = Buffer.from(JSON.stringify(freshSurveys, null, 2)).toString("base64");

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path,
          message: "Add new survey (retry)",
          content: freshContent,
          sha: freshSha,
        });
        console.log("DEBUG: Survey saved successfully after retry!");
        return newSurvey;
      }
      console.error("ERROR: Saving survey failed:", err.message);
      throw err;
    }
  } catch (err) {
    console.error("ERROR: saveSurvey failed:", err.message);
    throw err;
  }
}

module.exports = { getSurveys, saveSurvey };
