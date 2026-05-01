import { NextRequest, NextResponse } from "next/server";
import { activeUserError, getActiveUser } from "@/lib/auth/active-user";

export const runtime = "edge";
export const maxDuration = 60;

const MIME_MAP: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
  aiff: "audio/aiff",
  aif: "audio/aiff",
};

/**
 * Uploads an audio file to Gemini's File API and returns the file URI.
 * This bypasses Vercel's 4.5MB body limit for the analyze route because
 * the client uploads directly to this route (which streams to Gemini),
 * and then sends only the lightweight URI to /api/analyze.
 *
 * Gemini File API supports up to 2GB per file.
 */
export async function POST(req: NextRequest) {
  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return activeUserError(activeUser);

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = MIME_MAP[ext] ?? "audio/mpeg";
    const bytes = await file.arrayBuffer();
    const numBytes = bytes.byteLength;

    // Step 1: Start resumable upload
    const startRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": String(numBytes),
          "X-Goog-Upload-Header-Content-Type": mimeType,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: { display_name: file.name },
        }),
      }
    );

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error("[upload-audio] start failed:", startRes.status, errText.slice(0, 200));
      return NextResponse.json({ error: "Failed to start upload to Gemini" }, { status: 502 });
    }

    const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl) {
      return NextResponse.json({ error: "No upload URL returned from Gemini" }, { status: 502 });
    }

    // Step 2: Upload the file bytes
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
        "Content-Length": String(numBytes),
      },
      body: bytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("[upload-audio] upload failed:", uploadRes.status, errText.slice(0, 200));
      return NextResponse.json({ error: "Failed to upload file to Gemini" }, { status: 502 });
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData?.file?.uri;
    const fileName = uploadData?.file?.name;

    if (!fileUri) {
      console.error("[upload-audio] no URI in response:", JSON.stringify(uploadData).slice(0, 300));
      return NextResponse.json({ error: "No file URI returned" }, { status: 502 });
    }

    // Step 3: Poll until file is ACTIVE (processing can take a few seconds)
    let state = uploadData?.file?.state ?? "PROCESSING";
    let attempts = 0;
    while (state === "PROCESSING" && attempts < 20) {
      await new Promise((r) => setTimeout(r, 1500));
      const statusRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`
      );
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        state = statusData?.state ?? "PROCESSING";
      }
      attempts++;
    }

    if (state !== "ACTIVE") {
      return NextResponse.json(
        { error: "File processing timed out. Try a smaller file." },
        { status: 504 }
      );
    }

    return NextResponse.json({ fileUri, mimeType, fileName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload-audio]", msg);
    return NextResponse.json({ error: "Upload failed: " + msg }, { status: 500 });
  }
}
