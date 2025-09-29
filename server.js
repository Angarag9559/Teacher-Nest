const express = require("express");
const cors = require("cors");
const { saveSurvey, getSurveys } = require("./surveyService"); // new GitHub API module

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Get teachers list (still from JSON)
app.get("/teachers", (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, "teachers.json");
  let teachers = [];
  if (fs.existsSync(filePath)) {
    teachers = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  res.json(teachers);
});

// Submit survey → save to GitHub
app.post("/submit-survey", async (req, res) => {
  const { teacherId, text } = req.body;
  try {
    const survey = await saveSurvey({ teacherId, text });
    res.json({ status: "ok", survey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Get all surveys → fetch from GitHub
app.get("/surveys", async (req, res) => {
  try {
    const surveys = await getSurveys();
    res.json(surveys);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
