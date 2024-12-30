import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "OPENAI_API_KEY",
  "DATABASE_URL",
] as const;

const optionalEnvVars = [
  "",
] as const;

console.info("READING ENVIRONMENT VARIABLES");

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`===> The environment variable ${key} is not defined`);
  }
});

function getRequiredEnvVar(key: typeof requiredEnvVars[number]): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`La variable de entorno ${key} no está definida`);
  }
  return value;
}

function getOptionalEnvVar(key: typeof optionalEnvVars[number]): string | undefined {
  return process.env[key] || undefined;
}

export const {
  OPENAI_API_KEY,
  DATABASE_URL
} = {
  OPENAI_API_KEY: getRequiredEnvVar('OPENAI_API_KEY'),
  DATABASE_URL: getRequiredEnvVar('DATABASE_URL'),
} as const;

