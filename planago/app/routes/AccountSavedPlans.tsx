import { userSessionContext } from "~/context/userSessionContext";
import { db } from "~/shared/database";
import { plan } from "~/shared/database/schema";
import { eq, and } from "drizzle-orm";
import type { Route } from "./+types/AccountSavedPlans";
import { Form, Link, redirect, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const userSession = context.get(userSessionContext);
    if (!userSession) {
      throw new Response("Not authenticated", { status: 401 });
    }

    const userId = userSession.user.id;
    const plans = await db.select().from(plan).where(eq(plan.userId, userId));

    return { plans };
  } catch (error) {
    console.error("Fel vid hämtning av resplaner:", error);
    throw new Response("Kunde inte hämta resplaner", { status: 500 });
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const userSession = context.get(userSessionContext);
    if (!userSession || !userSession.user) {
      throw new Response("Not authenticated", { status: 401 });
    }

    const userId = userSession.user.id;
    const formData = await request.formData();
    const planId = formData.get("planId");

    if (!planId || typeof planId !== "string") {
      throw new Response("Plan ID saknas eller ogiltigt", { status: 400 });
    }
    await db
      .delete(plan)
      .where(and(eq(plan.id, planId), eq(plan.userId, userId)));

    return redirect("/konto/sparade-resplaner");
  } catch (error) {
    console.error("Error deleting plan:", error);
    return { error: "Det gick inte att radera resplan" };
  }
}

export default function AccountSavedPlans({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { plans } = loaderData;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState<string | null>(
    null
  );
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === "submitting") {
      setOpenDeleteDialog(false);
    }
  }, [navigation.state]);

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Mina sparade resplaner
            </h1>
            <p className="text-sm sm:text-base text-primary/75">
              Lista av sparade resplaner
            </p>
          </div>
          <Link
            to="/planago/skapa-resplan"
            className="mt-4 sm:mt-0 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
          >
            Skapa ny resplan
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="mt-10 text-primary/70 text-sm sm:text-base">
            Du har inga sparade resplaner ännu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/40">
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left">
                    Namn
                  </th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left hidden sm:table-cell">
                    Tid
                  </th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left hidden sm:table-cell">
                    Plats
                  </th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left sm:table-cell"></th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary text-left sm:table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan: any) => (
                  <tr
                    key={plan.id}
                    className="border-b border-primary/20 hover:bg-primary/5 transition"
                  >
                    <td className="px-3 py-2 text-sm font-medium">
                      <Link
                        to={`/planago/resplan/${plan.id}`}
                        className="text-accent hover:underline"
                      >
                        {plan.title}
                      </Link>

                      {/* Mobil */}
                      <div className="sm:hidden mt-2 text-xs text-primary/70 space-y-1">
                        <p>Tid: {plan.timeFrame}</p>
                        <p>Plats: {plan.location}</p>
                        <div className="flex gap-4 mt-2">
                          <Link
                            to={`/planago/redigera-resplan/${plan.id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            Redigera
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlanId(plan.id);
                              setSelectedPlanTitle(plan.title);
                              setOpenDeleteDialog(true);
                            }}
                            className="font-semibold text-accent hover:underline"
                          >
                            Radera
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Desktop */}
                    <td className="px-3 py-2 text-primary text-sm hidden sm:table-cell">
                      {plan.timeFrame}
                    </td>
                    <td className="px-3 py-2 text-primary text-sm hidden sm:table-cell">
                      {plan.location}
                    </td>

                    <td className="px-3 py-2 text-sm font-semibold text-primary hidden sm:table-cell">
                      <Link
                        to={`/planago/redigera-resplan/${plan.id}`}
                        className="hover:underline"
                      >
                        Redigera
                      </Link>
                    </td>

                    <td className="px-3 py-2 text-sm font-semibold text-accent hidden sm:table-cell">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setSelectedPlanTitle(plan.title);
                          setOpenDeleteDialog(true);
                        }}
                        className="font-semibold text-accent hover:underline"
                      >
                        Radera
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {actionData?.error && (
          <div className="mt-6 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {actionData.error}
          </div>
        )}
      </div>

      <Dialog
        open={openDeleteDialog}
        onClose={setOpenDeleteDialog}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-background/80" />

        <DialogPanel className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full p-6 border border-primary/20">
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
                    "{selectedPlanTitle}"
                  </span>
                  ? Denna åtgärd går inte att ångra.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Form method="post" className="w-full sm:w-auto">
                <input
                  type="hidden"
                  name="planId"
                  value={selectedPlanId ?? ""}
                />

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
          </div>
        </DialogPanel>
      </Dialog>
    </main>
  );
}
