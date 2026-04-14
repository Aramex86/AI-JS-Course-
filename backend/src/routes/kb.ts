import { Router } from "express";
import multer from "multer";
import { loadFile } from "../kb/01_loaders";
import { splitDocuments } from "../kb/02_spliter";
import { ingestDocuments } from "../kb/04_ingest";

export const kbRouter = Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, //10MB
  },
});

kbRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const namespace = "default";
    if (!req.file)
      return res.status(400).json({
        message: "No file uploaded, Please upload a file",
        success: false,
      });

    const { path, mimetype, originalname } = req.file;

    const rawDocs = await loadFile({
      filePath: path,
      mimeType: mimetype,
      originalName: originalname,
    });

    if (!rawDocs.length) {
      return res.status(400).json({
        message: "No file uploaded, Please upload a file",
        success: false,
      });
    }

    const chunks = await splitDocuments(rawDocs);

    if (!chunks.length) {
      return res.status(400).json({
        message: "File uploaded but no chunks created, Please try again later",
        success: false,
      });
    }

    //Ingest to vector store
    const summary = await ingestDocuments(namespace, chunks);

    return res.status(200).json({
      ok: summary.ok,
      namespace: summary.namespace,
      totalChunks: summary.totalChunks,
      source: summary.source,
    });
  } catch (e) {
    res.status(500).json({ message: "Error uploading file", success: false });
  }
});
