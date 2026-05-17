import { NextResponse } from "next/server";

type ErrorInit = {
  status?: number;
  code?: string;
  headers?: HeadersInit;
};

function codeForStatus(status: number) {
  if (status === 400) return "bad_request";
  if (status === 401) return "authentication_required";
  if (status === 403) return "forbidden";
  if (status === 413) return "payload_too_large";
  if (status === 422) return "unprocessable_request";
  if (status === 429) return "rate_limit_exceeded";
  if (status === 502) return "provider_error";
  if (status === 503) return "service_unavailable";
  if (status === 504) return "provider_timeout";
  return "internal_error";
}

export function apiError(message: string, init: ErrorInit = {}) {
  const status = init.status ?? 500;
  return NextResponse.json(
    {
      ok: false,
      error: message,
      code: init.code ?? codeForStatus(status),
    },
    {
      status,
      headers: init.headers,
    }
  );
}

export function providerError(
  provider: "Gemini" | "Lyria",
  status: number,
  fallback = `${provider} request failed. Try again shortly.`
) {
  if (status === 429) {
    return apiError(`${provider} quota was reached. Try again shortly.`, {
      status: 503,
      code: "provider_quota_exceeded",
    });
  }

  if (status === 408 || status === 504) {
    return apiError(`${provider} took too long to respond. Try again.`, {
      status: 504,
      code: "provider_timeout",
    });
  }

  if (status === 401 || status === 403) {
    return apiError("Service configuration error. Contact support.", {
      status: 500,
      code: "provider_auth_error",
    });
  }

  return apiError(fallback, {
    status: 502,
    code: "provider_error",
  });
}

export function logApiError(scope: string, err: unknown, context?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(scope, { message, ...context });
}
