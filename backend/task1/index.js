import express from "express";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/upload-audio", upload.single("audio"), (req, res) => {
  const filePath = req.file.path;

  exec(
    `whisper ${filePath} --model base --task transcribe --output_format txt --output_dir uploads`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("Whisper error:", err);
        console.error(stderr);
        if (!res.headersSent) {
          return res.status(500).send("Error processing audio");
        }
        return;
      }

      try {
        const txtPath = filePath + ".txt";
        const text = fs.readFileSync(txtPath, "utf-8");

        // ✅ Save ONLY JSON
        fs.writeFileSync(
          filePath + ".json",
          JSON.stringify({ text }, null, 2)
        );

        // ✅ Send response once
        res.json({ text });

        // ❌ delete audio
        fs.unlinkSync(filePath);

        // ❌ delete txt
        fs.unlinkSync(txtPath);

      } catch (e) {
        console.error("Read error:", e);
        if (!res.headersSent) {
          res.status(500).send("File read error");
        }
      }
    }
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});