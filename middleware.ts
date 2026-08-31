import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasAdminPreviewRequest } from "@/lib/admin-preview-edge";
import { isAuthRequired } from "@/lib/open-access";
import {
  OPEN_SESSION_SKIP_COOKIE,
  shouldSkipOpenSession,
} from "@/lib/open-session-edge";
import { isPreviewMode } from "@/lib/preview-mode";

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname.startsWith("/login");
  const isSignupRoute = pathname.startsWith("/signup");
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isOpenSession = pathname.startsWith("/api/auth/open-session");
  const isApiRoute = pathname.startsWith("/api");

  if (isPreviewMode() || (await hasAdminPreviewRequest(request))) {
    if (isLoginRoute || isSignupRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  if (!hasSupabaseConfig()) {
    if (!isAuthRequired() && (isLoginRoute || isSignupRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isSignupRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isApiRoute) {
    return supabaseResponse;
  }

  if (!isAuthRequired()) {
    if (isLoginRoute || isSignupRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (!user && !isOpenSession && !isAuthCallback && !shouldSkipOpenSession(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/api/auth/open-session";
      if (pathname !== "/") {
        url.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (!user && !isLoginRoute && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
