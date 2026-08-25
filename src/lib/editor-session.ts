import "server-only";

import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth-session";
import { isEditorUsername } from "@/lib/word-editor";

function editorUsername() {
  return process.env.EDITOR_USERNAME?.trim() || "leon";
}

export async function editorFromToken(token: string | undefined) {
  const secret = process.env.SESSION_SECRET ?? "";
  const session = await verifySessionToken(token, secret);
  if (!session || !isEditorUsername(session.username, editorUsername())) return null;
  return session;
}

export async function getEditorSession() {
  const cookieStore = await cookies();
  return editorFromToken(cookieStore.get(SESSION_COOKIE)?.value);
}
