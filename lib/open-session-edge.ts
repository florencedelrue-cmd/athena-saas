export const OPEN_SESSION_SKIP_COOKIE = "athena_open_session_skip";

export function shouldSkipOpenSession(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): boolean {
  return request.cookies.get(OPEN_SESSION_SKIP_COOKIE)?.value === "1";
}
