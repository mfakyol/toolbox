// Central configuration. Environment variables are read only here;
// the rest of the app never reads process.env directly.

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  maxFileSize: number;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 6000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024, // 25MB
};
