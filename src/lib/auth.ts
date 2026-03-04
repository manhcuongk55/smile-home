// Simple JWT helper using jose for Edge compatibility if needed later
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'smile-home-secret-key-for-dev';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  userId: string;
  role: 'ADMIN' | 'USER';
}

/**
 * Sign a new JWT token for testing/dev purposes
 */
export async function signJWT(payload: AuthUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * Verify token from header
 */
export async function verifyJWT(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthUser;
  } catch (error) {
    return null;
  }
}

/**
 * Extract user info from Request manually in App Router
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  // 1. Try Authorization Header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return verifyJWT(token);
  }

  // 2. Try Query Parameter (useful for SSE EventSource)
  const url = new URL(req.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam) {
    return verifyJWT(tokenParam);
  }

  return null;
}
