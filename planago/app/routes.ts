import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("*", "./routes/NotFound.tsx"),
  route("signin", "./routes/SignIn.tsx"),
  route("api/auth/*", "routes/Auth.ts"),
  route("how-to-use", "./routes/HowToUse.tsx"),
  route("about", "./routes/About.tsx"),
  layout("./routes/Shell.tsx", [
    route("planago/filter", "./routes/PlanagoFilter.tsx"),
    route("planago/plan", "./routes/PlanagoPlan.tsx"),
    route("account/saved-plans", "./routes/AccountSavedPlans.tsx"),
    route("account/settings", "./routes/AccountSettings.tsx"),
  ]),
] satisfies RouteConfig;
