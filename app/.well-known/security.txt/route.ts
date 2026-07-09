import { NextResponse } from "next/server";
import { BUSINESS, SITE_URL } from "@/lib/seo/site-info";

// RFC 9116 responsible-disclosure contact point.
export function GET() {
  const body = `Contact: mailto:${BUSINESS.email}
Expires: 2027-07-08T00:00:00.000Z
Preferred-Languages: nl, en
Canonical: ${SITE_URL}/.well-known/security.txt
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
