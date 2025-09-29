const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // put your HTML, images, etc. in "public" folder

// Get teachers list
app.get("/teachers", (req, res) => {
  const filePath = path.join(__dirname, "teachers.json");
  let teachers = [];
  if (fs.existsSync(filePath)) {
    teachers = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  res.json(teachers);
});

// Submit survey
app.post("/submit-survey", (req, res) => {
  const { teacherId, text } = req.body;
  const filePath = path.join(__dirname, "surveys.json");

  let surveys = {};
  if (fs.existsSync(filePath)) {
    surveys = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  if (!surveys[teacherId]) surveys[teacherId] = [];
  surveys[teacherId].push(text);

  fs.writeFileSync(filePath, JSON.stringify(surveys, null, 2));
  res.send({ status: "ok" });
});

// Get all surveys (for admin)
app.get("/surveys", (req, res) => {
  const filePath = path.join(__dirname, "surveys.json");
  let surveys = {};
  if (fs.existsSync(filePath)) {
    surveys = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  res.json(surveys);
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://localhost:${PORT}`));
