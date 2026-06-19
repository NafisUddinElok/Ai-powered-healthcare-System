import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import cors from "cors";
import fs from "fs";
import { exec } from "child_process"; // for ner


const app = express();
app.use(cors());


if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
    }

const upload = multer({ dest: "uploads/" });


// for ner ai model
function runNER(text, callback) {
  exec(`python3 ner.py "${text}"`, (err, stdout) => {
    if (err) return callback(err);

    const entities = JSON.parse(stdout);
    callback(null, entities);
  });
}

function cleanEntities(entities) {
  return entities.filter(e => {
    // remove noisy labels
    const badTexts = ["MD", "Reg", "No", "Dr"];
    if (badTexts.includes(e.text)) return false;

    // ignore very short words
    if (e.text.length < 3) return false;

    return true;
  });
}


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

    


    runNER(text, (err, entities) => {
      if (err) return res.status(500).send("NER error");

      const cleaned = cleanEntities(entities);

      res.json({
        text,
        structured: extracted,
        entities : cleaned
      });
    });
    

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).send("OCR failed");
  }
});

app.listen(3001, () => {
  console.log("OCR server running on http://localhost:3001");
});