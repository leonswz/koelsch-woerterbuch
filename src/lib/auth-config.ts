export type LoginAccount = {
  username: string;
  password: string;
};

export type AuthEnvironment = {
  accounts: LoginAccount[];
  secret: string;
};

export function authEnvironment(
  environment: Record<string, string | undefined> = process.env,
): AuthEnvironment | null {
  const username = environment.APP_USERNAME?.trim();
  const password = environment.APP_PASSWORD;
  const secret = environment.SESSION_SECRET;
  if (!username || !password || !secret || secret.length < 32) return null;

  const accounts: LoginAccount[] = [{ username, password }];
  const demoUsername = environment.DEMO_USERNAME?.trim();
  const demoPassword = environment.DEMO_PASSWORD;
  if (demoUsername && demoPassword) {
    accounts.push({ username: demoUsername, password: demoPassword });
  }

  return { accounts, secret };
}

export function accountIsConfigured(
  username: string,
  accounts: LoginAccount[],
) {
  const normalized = username.trim().toLocaleLowerCase("de-DE");
  return accounts.some(
    (account) =>
      account.username.trim().toLocaleLowerCase("de-DE") === normalized,
  );
}
