export class IEnv {
  MONGO_URI: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  NODE_ENV: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRE: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IEnv {}
  }
}
