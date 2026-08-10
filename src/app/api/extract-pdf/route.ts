import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      return NextResponse.json({ error: "No readable text found in this PDF" }, { status: 400 });
    }

    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: "Failed to parse PDF file" }, { status: 500 });
  }
}
