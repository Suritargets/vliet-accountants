import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { homepageContent, servicesContent } from "@/drizzle/schema";
import { homepageDefaults, type HomepageContent } from "./homepage-defaults";
import {
  servicesDefaults,
  type ServiceContent,
  type ServiceKey,
} from "./services-defaults";
import { mergeContent, parseJsonContent } from "./merge";

// Resolution order: NL code defaults ← NL admin override ← (EN admin override
// when locale is 'en'). An EN visitor sees NL content for anything the EN tab
// hasn't filled in yet — and any DB failure falls back to the code defaults.

export async function getHomepage(locale: string): Promise<HomepageContent> {
  try {
    const rows = await db.select().from(homepageContent);
    const nl = parseJsonContent(rows.find((r) => r.locale === "nl")?.content);
    const en =
      locale === "en"
        ? parseJsonContent(rows.find((r) => r.locale === "en")?.content)
        : null;
    return mergeContent(homepageDefaults, nl, en);
  } catch {
    return homepageDefaults;
  }
}

export async function getService(
  key: ServiceKey,
  locale: string
): Promise<ServiceContent> {
  const defaults = servicesDefaults[key];
  try {
    const rows = await db
      .select()
      .from(servicesContent)
      .where(eq(servicesContent.serviceKey, key));
    const nl = parseJsonContent(rows.find((r) => r.locale === "nl")?.content);
    const en =
      locale === "en"
        ? parseJsonContent(rows.find((r) => r.locale === "en")?.content)
        : null;
    return mergeContent(defaults, nl, en);
  } catch {
    return defaults;
  }
}
