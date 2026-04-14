import { Document } from "@langchain/core/documents";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";

// type SupportedMime = "application/pdf" | "text/markDown" | "text/plain";

interface LoadFileArgs {
  filePath: string;
  mimeType: string;
  originalName: string;
}

function getExt(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index + 1).toLowerCase();
}

export async function loadFile({
  filePath,
  mimeType,
  originalName,
}: LoadFileArgs): Promise<Document[]> {
  const extractExt = getExt(originalName);

  const isMakdown =
    mimeType === "text/markDown" ||
    extractExt === "md" ||
    extractExt === "markdown";
  const isText = mimeType === "text/plain" || extractExt === "txt";
  const isPdf = mimeType === "application/pdf" || extractExt === "pdf";

  if (isPdf) {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source: originalName,
      },
    }));
  }

  if (isText || isMakdown) {
    const loader = new TextLoader(filePath);
    const docs = await loader.load();
    return docs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source: originalName,
      },
    }));
  }

  return [];
}
