import { NextRequest, NextResponse } from "next/server";
import { activeUserError, getActiveUser } from "@/lib/auth/active-user";
import { apiError, logApiError, providerError } from "@/lib/api/errors";

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

const DEFAULT_UPLOAD_AUDIO_MAX_MB = 25;

function maxUploadBytes() {
  const parsed = Number(process.env.UPLOAD_AUDIO_MAX_MB);
  const mb = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_UPLOAD_AUDIO_MAX_MB;
  return mb * 1024 * 1024;
}

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
    return apiError("Service is not configured. Contact support.", { status: 500, code: "server_not_configured" });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided.", { status: 400, code: "missing_file" });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = MIME_MAP[ext];
    if (!mimeType) {
      return apiError(`Unsupported audio type. Use: ${Object.keys(MIME_MAP).join(", ")}.`, {
        status: 400,
        code: "unsupported_audio_type",
      });
    }

    const limitBytes = maxUploadBytes();
    if (file.size > limitBytes) {
      return apiError(`Audio file is too large. Maximum upload is ${Math.round(limitBytes / 1024 / 1024)}MB.`, {
        status: 413,
      });
    }

    const bytes = await file.arrayBuffer();
    const numBytes = bytes.byteLength;
    if (numBytes > limitBytes) {
      return apiError(`Audio file is too large. Maximum upload is ${Math.round(limitBytes / 1024 / 1024)}MB.`, {
        status: 413,
      });
    }

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
      return providerError("Gemini", startRes.status, "Unable to start audio upload. Try again shortly.");
    }

    const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl) {
      return apiError("Unable to start audio upload. Try again shortly.", { status: 502, code: "provider_missing_upload_url" });
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
      return providerError("Gemini", uploadRes.status, "Unable to upload audio. Try again shortly.");
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData?.file?.uri;
    const fileName = uploadData?.file?.name;

    if (!fileUri) {
      console.error("[upload-audio] no URI in response:", JSON.stringify(uploadData).slice(0, 300));
      return apiError("Audio upload completed without a usable file reference. Try again.", {
        status: 502,
        code: "provider_missing_file_uri",
      });
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
      return apiError("File processing timed out. Try a smaller file.", { status: 504 });
    }

    return NextResponse.json({ fileUri, mimeType, fileName });
  } catch (err: unknown) {
    logApiError("[upload-audio]", err);
    return apiError("Upload failed. Try again shortly.", { status: 500, code: "upload_failed" });
  }
}
