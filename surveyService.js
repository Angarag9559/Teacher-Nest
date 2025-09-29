const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;
const path = "surveys.json";

// Fetch all surveys
async function getSurveys() {
  const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`);
  return await res.json();
}

// Save a new survey
async function saveSurvey(newSurvey) {
  // Get current file content
  const { data: fileData } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  const surveys = JSON.parse(Buffer.from(fileData.content, "base64").toString());
  surveys.push(newSurvey);

  // Update the file in GitHub
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: "Add new survey",
    content: Buffer.from(JSON.stringify(surveys, null, 2)).toString("base64"),
    sha: fileData.sha,
  });

  return newSurvey;
}

module.exports = { getSurveys, saveSurvey };
