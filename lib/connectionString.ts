// Pin `sslmode=verify-full` when an incoming URL uses one of the legacy
// aliases (prefer / require / verify-ca). pg-connection-string v3 + pg
// v9 will give those modes weaker semantics (closer to libpq); making
// the historical behavior explicit silences the deprecation warning and
// prevents a silent downgrade when those majors land.
export function normalizeSslmode(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const mode = parsed.searchParams.get("sslmode");
  if (mode === "prefer" || mode === "require" || mode === "verify-ca") {
    parsed.searchParams.set("sslmode", "verify-full");
    return parsed.toString();
  }
  return url;
}
