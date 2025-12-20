import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("*", "./routes/NotFound.tsx"),
  route("logga-in", "./routes/SignIn.tsx"),
  route("api/auth/*", "routes/Auth.ts"),
  route("hur-fungerar-planago", "./routes/HowToUse.tsx"),
  route("om-oss", "./routes/About.tsx"),
  layout("./routes/Shell.tsx", [
    route("planago/skapa-resplan", "./routes/PlanagoFilter.tsx"),
    route("planago/resplan/:planId", "./routes/PlanagoPlan.tsx"),
    route("planago/redigera-resplan/:planId", "./routes/PlanagoEditPlan.tsx"),
    route("konto/sparade-resplaner", "./routes/AccountSavedPlans.tsx"),
    route("konto/installningar", "./routes/AccountSettings.tsx"),
  ]),
] satisfies RouteConfig;
