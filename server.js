const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { saveSurvey, getSurveys } = require("./surveyService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Get teachers list (still from local JSON)
app.get("/teachers", (req, res) => {
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

  if (!teacherId || !text) return res.status(400).json({ status: "error", message: "Missing teacherId or text" });

  const surveyData = {
    teacherId,
    text,
    createdAt: new Date().toISOString()
  };

  try {
    const survey = await saveSurvey(surveyData);
    res.json({ status: "ok", survey });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Get all surveys → fetch from GitHub
app.get("/surveys", async (req, res) => {
  try {
    const surveys = await getSurveys();
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://localhost:${PORT}`));
