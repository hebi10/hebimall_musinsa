export interface QnASecurity {
  passwordHash: string;
  passwordSalt: string;
}

const TEXT_ENCODER = new TextEncoder();
const SALT_SIZE = 16;

function toBase64(input: Uint8Array): string {
  const chars = String.fromCharCode(...Array.from(input));
  return btoa(chars);
}

function randomSalt(): string {
  const salt = new Uint8Array(SALT_SIZE);
  crypto.getRandomValues(salt);
  return toBase64(salt);
}

export async function hashQnASecret(password: string, salt: string): Promise<string> {
  const raw = TEXT_ENCODER.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', raw);
  return toBase64(new Uint8Array(digest));
}

export async function buildQnASecurity(password: string): Promise<QnASecurity> {
  const salt = randomSalt();
  const passwordHash = await hashQnASecret(password, salt);

  return {
    passwordHash,
    passwordSalt: salt,
  };
}
