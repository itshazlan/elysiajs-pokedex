import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import { authRoutes } from "@routes/auth";
import { jwt } from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import { pokedexRoutes } from "@routes/pokedex";

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Pokedex Documentation",
          version: "1.0.0",
        },
        tags: [
          { name: "Auth", description: "Authentication Endpoints" },
          { name: "Pokedex", description: "Pokedex Endpoints" },
        ],
      },
    })
  )

  .group("/api", (app) =>
    app
      .use(
        jwt({
          name: "jwt",
          secret: Bun.env.JWT_SECRET!,
        })
      )
      .use(cookie())
      .use(authRoutes)
      .use(pokedexRoutes)
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
