import { Elysia, t } from "elysia";
import { isAuthenticated } from "../middlewares/auth";
import db from "../database/db";

export const pokedexRoutes = (elysia: Elysia) =>
  elysia.group("/pokedex", (app) =>
    app
      .use(isAuthenticated)
      .get(
        "/:authorId",
        async ({ set, params }) => {
          const { authorId } = params;
          const pokedex = await db.pokedex.findMany({
            where: {
              authorId,
            },
            orderBy: {
              name: "asc",
            },
          });

          set.status = 200;
          return {
            status: 200,
            message: "Fetch all pokemons",
            data: pokedex,
          };
        },
        {
          params: t.Object({
            authorId: t.String(),
          }),
          detail: {
            tags: ["Pokedex"],
            summary: "Get all pokemons",
          },
        }
      )
      .get(
        "/:authorId/:id",
        async ({ params, set }) => {
          const { authorId, id } = params;
          const pokedex = await db.pokedex.findFirst({
            where: {
              authorId,
              id,
            },
          });

          set.status = 200;
          return {
            status: 200,
            message: "Fetch pokemon by id",
            data: pokedex,
          };
        },
        {
          params: t.Object({
            authorId: t.String(),
            id: t.String(),
          }),
          detail: {
            tags: ["Pokedex"],
            summary: "Get a pokemon by id",
          },
        }
      )
      .post(
        "/addPokemon",
        async ({ body, set, user }) => {
          const pokedex = await db.pokedex.create({
            data: {
              authorId: user!.id,
              ...body,
            },
          });

          set.status = 201;
          return {
            status: 201,
            message: "Create pokemon successfully",
            data: pokedex,
          };
        },
        {
          body: t.Object({
            name: t.String(),
            type: t.String(),
            mainImage: t.Optional(t.String()),
            description: t.String(),
            tags: t.String(),
          }),
          detail: {
            tags: ["Pokedex"],
            summary: "Add a new pokemon",
          },
        }
      )
      .put(
        "/updatePokemon/:id",
        async ({ params, set, body, user }) => {
          const { id } = params;          
          const pokedex = await db.pokedex.update({
            where: {
              authorId: user!.id,
              id,
            },
            data: body,
          });

          set.status = 200;
          return {
            status: 200,
            message: "Pokemon updated successfully",
            data: pokedex,
          };
        },
        {
          body: t.Object({
            name: t.String(),
            type: t.String(),
            mainImage: t.String(),
            description: t.String(),
            tags: t.String(),
          }),
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["Pokedex"],
            summary: "Update an existing pokemon",
          },
        }
      )
      .delete(
        "/:id",
        async ({ params, set, user }) => {
          const { id } = params;
          await db.pokedex.delete({
            where: {
              authorId: user!.id,
              id,
            },
          });

          set.status = 200;
          return {
            status: 200,
            data: null,
            message: "Pokemon deleted successfully",
          };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["Pokedex"],
            summary: "Remove a pokemon",
          },
        }
      )
  );
