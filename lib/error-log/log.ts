import "server-only";
import { db } from "@/lib/db";
import { errorEvents } from "@/drizzle/schema";

const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 3000;

interface LogErrorOptions {
  source?: "client" | "server";
  path?: string;
  digest?: string;
  // Overrides the stack derived from `error` — nodig wanneer de fout hier
  // opnieuw wordt geconstrueerd (bv. in de client-error-route, waar de
  // browser-stack apart wordt meegegeven en niet gelijk is aan de stack
  // van een lokaal aangemaakt Error-object).
  stack?: string;
}

// Fail-open, zelfde idioom als lib/rate-limit.ts en lib/mail/send.ts: nooit
// gooien, nooit de aanroepende flow blokkeren. De bestaande console.error op
// de call-site blijft ongewijzigd staan — dit voegt alleen een DB-rij toe.
export async function logError(
  context: string,
  error: unknown,
  options: LogErrorOptions = {}
): Promise<void> {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const derivedStack = error instanceof Error ? error.stack : undefined;
    const stack = options.stack ?? derivedStack;

    await db.insert(errorEvents).values({
      source: options.source ?? "server",
      context,
      message: message.slice(0, MAX_MESSAGE_LENGTH),
      stack: stack ? stack.slice(0, MAX_STACK_LENGTH) : null,
      digest: options.digest ?? null,
      path: options.path ?? null,
    });
  } catch (loggingError) {
    console.error("logError failed:", loggingError);
  }
}
