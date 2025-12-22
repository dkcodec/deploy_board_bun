import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authModule } from "./modules/auth/auth.routes";
import { jwtPlugin } from "./plugins/jwt";
import { AppError } from "./utils/errors";
import { projectsModule } from "./modules/projects/projects.routes";

export const app = new Elysia()
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.status;
      return {
        message: error.message,
      };
    }

    console.error(error);
    set.status = 500;
    return {
      message: "Internal server error",
    };
  })
  .use(cors())
  .use(authModule)
  .use(projectsModule)
  .get("/health", () => ({ ok: true }));
