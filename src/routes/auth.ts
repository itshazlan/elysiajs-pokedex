import { Elysia, t } from "elysia";

import { comparePassword, hashPassword, md5hash } from "@utils/bcrypt";
import { isAuthenticated } from "../middlewares/auth";
import db from "../database/db";

export const authRoutes = (app: Elysia) =>
  // elysia.group("/auth", (app) =>
  app
    .post(
      "/register",
      async ({ body, set }) => {
        const { name, email, username, password } = body;

        const emailExists = await db.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
          },
        });

        if (emailExists) {
          set.status = 400;
          return {
            status: 400,
            data: null,
            message: "Email address already in use.",
          };
        }

        const usernameExists = await db.user.findUnique({
          where: {
            username,
          },
          select: {
            id: true,
          },
        });

        if (usernameExists) {
          set.status = 400;
          return {
            status: 400,
            data: null,
            message: "Someone already taken this username.",
          };
        }

        const { hash, salt } = await hashPassword(password);
        const emailHash = md5hash(email);
        const profileImage = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

        const newUser = await db.user.create({
          data: {
            name,
            email,
            hash,
            salt,
            username,
            profileImage,
          },
        });

        set.status = 201;
        return {
          status: 201,
          message: "Account created",
          data: newUser,
        };
      },
      {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          username: t.String(),
          password: t.String(),
        }),
        detail: {
          tags: ["Auth"],
          summary: "Register an account",
        },
      }
    )
    .post(
      "/login",
      // @ts-ignore
      async ({ body, set, jwt, cookie }) => {
        const { username, password } = body;

        const user = await db.user.findFirst({
          where: {
            OR: [
              {
                email: username,
              },
              {
                username,
              },
            ],
          },
        });

        if (!user) {
          set.status = 401;
          return {
            status: 401,
            data: null,
            message: "Invalid credentials",
          };
        }

        const match = await comparePassword(password, user.salt, user.hash);

        if (!match) {
          set.status = 401;
          return {
            status: 401,
            data: null,
            message: "Invalid credentials",
          };
        }

        const accessToken = await jwt.sign({
          userId: user.id,
        });

        const refreshToken = await jwt.sign({
          userId: user.id,
        });

        cookie.access_token.set({
          value: accessToken,
          maxAge: 15 * 60, // 15 minutes
          path: "/",
        });

        cookie.refresh_token.set({
          value: refreshToken,
          maxAge: 86400 * 7, // 7 days
          path: "/",
        });

        set.status = 200;
        return {
          status: 200,
          data: {
            user,
          },
          message: "Account login successfully",
        };
      },
      {
        body: t.Object({
          username: t.String(),
          password: t.String(),
        }),
        detail: {
          tags: ["Auth"],
          summary: "Login a registered user",
        },
      }
    )
    .use(isAuthenticated)
    .get(
      "/me",
      ({ user, set }) => {
        try {
          set.status = 200;
          return {
            status: 200,
            message: "Fetch authenticated user details",
            data: {
              user,
            },
          };
        } catch (error) {
          set.status = 400;
          return {
            status: 400,
            message: "An error occured",
            data: null,
          };
        }
      },
      {
        detail: {
          tags: ["Auth"],
          summary: "Get user informations",
        },
      }
    );
// );
