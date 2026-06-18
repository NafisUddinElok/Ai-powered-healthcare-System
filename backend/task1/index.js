import express from "express";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";
import cors from "cors";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

function extractData(text) {
  const lower = text.toLowerCase();

  const symptoms = [];

  // simple symptom keywords
  const symptomKeywords = [
    "chest pain",
    "fever",
    "cough",
    "headache",
    "vomiting",
    "dizziness",
  ];

  symptomKeywords.forEach((symptom) => {
    if (lower.includes(symptom)) {
      symptoms.push(symptom);
    }
  });

  // duration extract (simple regex)
  const durationMatch = lower.match(
    /(\d+\s*(day|days|week|weeks|month|months|year|years))/
  );

  const duration = durationMatch ? durationMatch[0] : null;

  return {
    symptoms,
    duration,
  };
}

// custom backed api endpoint for this project and for task1
app.post("/upload-audio", upload.single("audio"), (req, res) => {
  const filePath = req.file.path;

  exec(
  `whisper ${filePath} --model medium --task translate --output_format txt --output_dir uploads`,
  (err, stdout, stderr) => {
    if (err) {
      console.error("Whisper error:", err);
      return res.status(500).send("Error");
    }

    try {
      const txtPath = filePath + ".txt";
      const text = fs.readFileSync(txtPath, "utf-8").trim();
      const extracted = extractData(text);


      fs.writeFileSync(
        filePath + ".json",
        JSON.stringify({ text }, null, 2)
      );

      res.json({ 
        text,
        structured : extracted,
       });

      fs.unlinkSync(filePath);
      fs.unlinkSync(txtPath);

    } catch (e) {
      res.status(500).send("Read error");
    }
  }
);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});