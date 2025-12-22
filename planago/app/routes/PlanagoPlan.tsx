import { db } from "~/shared/database";
import type { Route } from "./+types/PlanagoPlan";
import { plan } from "~/shared/database/schema";
import { eq, and } from "drizzle-orm";
import { Form, Link, redirect, useNavigate } from "react-router";
import { userSessionContext } from "~/context/userSessionContext";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export async function loader({ params, context }: Route.LoaderArgs) {
  try {
    const userSession = context.get(userSessionContext);
    if (!userSession) {
      throw new Response("Not authenticated", { status: 401 });
    }

    const userId = userSession.user.id;
    const { planId } = params;

    const result = await db
      .select()
      .from(plan)
      .where(and(eq(plan.id, planId), eq(plan.userId, userId)))
      .limit(1);

    if (!result.length) {
      throw new Response("Planen kunde inte hittas", { status: 404 });
    }

    return { plan: result[0] };
  } catch (error: any) {
    console.error("Loader error:", error);
    if (error instanceof Response) throw error;
    throw new Response("Ett oväntat fel inträffade vid hämtning av resplanen", {
      status: 500,
    });
  }
}

export async function action({ request, params, context }: Route.ActionArgs) {
  try {
    const userSession = context.get(userSessionContext);
    if (!userSession) {
      throw new Response("Not authenticated", { status: 401 });
    }

    const userId = userSession.user.id;
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
      await db
        .delete(plan)
        .where(and(eq(plan.id, params.planId), eq(plan.userId, userId)));
    }

    return redirect("/konto/sparade-resplaner");
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return { error: "Det gick inte att radera din resplan." };
  }
}

export default function PlanagoPlan({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { plan } = loaderData;
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <main className="flex-grow bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              {plan.title}
            </h1>
            <p className="text-sm sm:text-base text-primary/75">
              Du kan redigera eller radera din resplan
            </p>
          </div>
          <Link
            to="/konto/sparade-resplaner"
            className="mt-4 sm:mt-0 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
          >
            Se sparade resplaner
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/40">
                <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left">
                  Tid
                </th>
                <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left hidden sm:table-cell">
                  Plats
                </th>
                <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left hidden sm:table-cell">
                  Adress
                </th>
                <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left hidden sm:table-cell">
                  Hitta hit
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.activities.map((item: any) => (
                <tr
                  key={item.link}
                  className="border-b border-primary/20 hover:bg-primary/5 transition"
                >
                  <td className="px-3 py-2 text-primary font-medium text-sm">
                    <p>{item.time}</p>
                    {/* Mobil */}
                    <div className="sm:hidden mt-2 text-xs text-primary/70 space-y-1">
                      <p>Plats: {item.name}</p>
                      <p>Adress: {item.address}</p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline hover:text-accent/80 block"
                      >
                        Visa på karta
                      </a>
                    </div>
                  </td>

                  {/* Desktop */}
                  <td className="px-3 py-2 text-primary text-sm hidden sm:table-cell">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 text-primary text-sm hidden sm:table-cell">
                    {item.address}
                  </td>
                  <td className="px-3 py-2 text-sm hidden sm:table-cell">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline hover:text-accent/80"
                    >
                      Visa på karta
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Form method="post" className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
            onClick={() => navigate(`/planago/redigera-resplan/${plan.id}`)}
          >
            Redigera resplan
          </button>
          <button
            type="button"
            onClick={() => setOpenDeleteDialog(true)}
            className="flex-1 rounded-md bg-accent px-4 py-2 text-primary-foreground shadow hover:bg-accent/90"
          >
            Radera resplan
          </button>
        </Form>

        <Dialog
          open={openDeleteDialog}
          onClose={setOpenDeleteDialog}
          className="relative z-10"
        >
          <DialogBackdrop className="fixed inset-0 bg-background/80" />

          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            <DialogPanel className="bg-background rounded-lg shadow-xl max-w-lg w-full p-6 border border-primary/20">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/20 sm:mx-0 sm:size-10">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="size-6 text-accent"
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-primary"
                  >
                    Radera resplan
                  </DialogTitle>
                  <p className="mt-2 text-sm text-primary/70">
                    Är du säker på att du vill radera resplanen
                    <span className="font-semibold text-primary">
                      {" "}
                      "{plan.title}"
                    </span>
                    ? Denna åtgärd går inte att ångra.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Form method="post" className="w-full sm:w-auto">
                  <input type="hidden" name="intent" value="delete" />
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground shadow hover:bg-accent/90 sm:w-auto"
                  >
                    Radera
                  </button>
                </Form>

                <button
                  type="button"
                  onClick={() => setOpenDeleteDialog(false)}
                  className="inline-flex w-full justify-center rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary shadow hover:bg-primary/20 sm:w-auto"
                >
                  Avbryt
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {actionData?.error && (
          <div className="mt-6 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {actionData.error}
          </div>
        )}
      </div>
    </main>
  );
}
