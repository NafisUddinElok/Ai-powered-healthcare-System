import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());


if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
    }

const upload = multer({ dest: "uploads/" });

function extractData(text) {
  const lower = text.toLowerCase();

  const symptoms = [];
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

  const durationMatch = lower.match(
    /(\d+\s*(day|days|week|weeks|month|months|year|years))/
  );

  const duration = durationMatch ? durationMatch[0] : null;

  return { symptoms, duration };
}



app.post("/upload-image", upload.single("image"), async (req, res) => {
  
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  
  const filePath = req.file.path;

  try {
    const result = await Tesseract.recognize(filePath, "eng");

    const text = result.data.text;

    const extracted = extractData(text);


    res.json({ 
        text,
        structured : extracted
    });
    

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).send("OCR failed");
  }
});

// ✅ MUST
app.listen(3001, () => {
  console.log("OCR server running on http://localhost:3001");
});