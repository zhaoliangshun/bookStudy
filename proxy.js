import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" && request.method === "GET") {
    const lastBook = request.cookies.get("last_book")?.value;
    
    if (lastBook) {
      try {
        const decoded = decodeURIComponent(lastBook);
        if (
          decoded.startsWith("/") &&
          decoded !== "/" &&
          !decoded.includes("//") &&
          !decoded.includes("..") &&
          decoded.length < 100 &&
          /^\/[a-zA-Z0-9\-_/]+$/.test(decoded)
        ) {
          const url = request.nextUrl.clone();
          url.pathname = decoded;
          url.search = request.nextUrl.search;
          url.hash = request.nextUrl.hash;
          return NextResponse.redirect(url, 307);
        }
      } catch {}
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
