interface NextAuthConfig {
  providers: string[];
  sessionStrategy: string;
  sessionMaxAge: number;
  signInPage: string;
  hasJwtCallback: boolean;
  hasSessionCallback: boolean;
}

function validateAuthConfig(config: NextAuthConfig): void {
  if (config.providers.length === 0) throw new Error("Auth must have at least one provider");
  if (!config.providers.includes("credentials")) {
    throw new Error("Auth must include credentials provider");
  }
  if (config.sessionStrategy !== "jwt") {
    throw new Error("Session strategy must be 'jwt'");
  }
  if (config.sessionMaxAge !== 30 * 60) {
    throw new Error("Session maxAge must be 1800 (30 minutes)");
  }
  if (config.signInPage !== "/login") {
    throw new Error("Sign-in page must be '/login'");
  }
  if (!config.hasJwtCallback) throw new Error("Auth must have JWT callback");
  if (!config.hasSessionCallback) throw new Error("Auth must have Session callback");
}

interface JWTPayload {
  sub?: string;
  email?: string;
  rol?: string;
}

function validateJWTCallback(token: JWTPayload, user: { rol?: string } | null): JWTPayload {
  const result = { ...token };
  if (user?.rol) {
    result.rol = user.rol;
  }
  return result;
}

interface SessionUser {
  rol?: string;
}

function validateSessionCallback(
  session: { user?: SessionUser },
  token: JWTPayload
): { user?: SessionUser } {
  const result = { ...session, user: { ...session.user } };
  if (token.rol) {
    (result.user as any).rol = token.rol;
  }
  return result;
}

const authConfig: NextAuthConfig = {
  providers: ["credentials"],
  sessionStrategy: "jwt",
  sessionMaxAge: 30 * 60,
  signInPage: "/login",
  hasJwtCallback: true,
  hasSessionCallback: true,
};

validateAuthConfig(authConfig);

const token1 = validateJWTCallback({}, { rol: "Propietario" });
if (token1.rol !== "Propietario") throw new Error("JWT callback must set rol");

const session1 = validateSessionCallback({ user: {} }, { rol: "Propietario" });
if ((session1.user as any)?.rol !== "Propietario") throw new Error("Session callback must set rol");
