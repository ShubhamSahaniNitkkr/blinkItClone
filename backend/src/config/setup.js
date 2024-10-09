import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";

AdminJS.registerAdapter(AdminJSMongoose);

export const admin = new AdminJS({
  resources: [
    {
      resource: Models.Customer,
      options: {
        listProperties: ["phone", "role", "isActivated"],
        filterProperties: ["phone", "role"],
        navigation: "Menus",
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        listProperties: ["email", "role"],
        filterProperties: ["email", "role"],
        navigation: "Menus",
      },
    },
    {
      resource: Models.Admin,
      options: {
        listProperties: ["email", "role"],
        filterProperties: ["email", "role"],
        navigation: "Menus",
      },
    },
    {
      resource: Models.Branch,
      options: {
        navigation: "Menus",
      },
    },
    {
      resource: Models.Category,
      options: {
        navigation: "Menus",
      },
    },
    {
      resource: Models.Product,
      options: {
        navigation: "Menus",
      },
    },
    {
      resource: Models.Counter,
      options: {
        navigation: "Menus",
      },
    },
    {
      resource: Models.Order,
      options: {
        navigation: "Menus",
      },
    },
  ],
  branding: {
    companyName: "BlinkIt",
    withMadeWithLove: false,
    // favicon: "Cloudinary icon",
    // logo: "Cloudinary icon",
  },
  defaultTheme: light.id,
  availableThemes: [dark, light, noSidebar],
  rootPath: "/admin",
});

export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: "adminjs",
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
};
