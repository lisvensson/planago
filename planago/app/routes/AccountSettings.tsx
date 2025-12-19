import { Form, redirect } from "react-router";
import type { Route } from "./+types/AccountSettings";
import { userSessionContext } from "~/context/userSessionContext";
import { db } from "~/shared/database";
import { user } from "~/shared/database/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const userSession = context.get(userSessionContext);
    if (!userSession || !userSession.user) {
      throw new Response("Not authenticated", { status: 401 });
    }

    const { id, email, name, image } = userSession.user;

    return {
      user: { id, email, name, image },
    };
  } catch (error) {
    console.error("Fel vid hämtning av användardata:", error);
    throw new Response("Kunde inte hämta användardata", { status: 500 });
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
    const intent = formData.get("intent");

    if (intent === "updateName") {
      const newName = formData.get("name");
      if (typeof newName !== "string" || newName.trim() === "") {
        return { error: "Ogiltigt namn" };
      }

      await db
        .update(user)
        .set({ name: newName, updatedAt: new Date() })
        .where(eq(user.id, userId));

      return { success: true };
    }

    if (intent === "deleteAccount") {
      await db.delete(user).where(eq(user.id, userId));
      return redirect("/signin");
    }

    return { error: "Ogiltig åtgärd" };
  } catch (error) {
    console.error("Error in account action:", error);
    return { error: "Det gick inte att utföra åtgärden" };
  }
}

export default function AccountSettings({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const [showToast, setShowToast] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    if (actionData && !actionData.error) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        {actionData?.error && (
          <div className="mt-6 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {actionData.error}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary">
              Personlig information
            </h2>
            <p className="mt-2 text-primary/70">
              Här kan du redigera ditt namn
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-4">
            <img
              src={
                user.image && user.image.trim() !== ""
                  ? user.image
                  : "https://i0.wp.com/digitalhealthskills.com/wp-content/uploads/2022/11/3da39-no-user-image-icon-27.png?fit=500%2C500&ssl=1"
              }
              alt="User avatar"
              className="w-24 h-24 rounded-full border border-primary/30"
            />
            <Form method="post" className="w-full space-y-4">
              <input type="hidden" name="intent" value="updateName" />
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-primary"
                >
                  Namn
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={user.name}
                  className="mt-1 w-full rounded-md border border-primary/30 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary"
                >
                  E‑postadress
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  className="mt-1 w-full rounded-md border border-primary/30 px-3 py-2"
                  disabled
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
              >
                Spara
              </button>
            </Form>
          </div>
        </div>

        <Transition
          show={showToast}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed top-4 right-4 z-50 w-72 rounded-lg bg-white shadow-lg ring-1 ring-black/10 p-4">
            <div className="flex items-start">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5 text-accent mr-3 flex-shrink-0"
              >
                <path d="M9 12.75l2.25 2.25L15 9.75m6.75 2.25a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0z" />
              </svg>
              <p className="text-sm font-semibold text-primary">
                Namnet har uppdaterats!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="absolute top-2 right-2 text-primary/60 hover:text-primary/90"
            >
              <span className="sr-only">Stäng</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </Transition>

        <hr className="border-t border-primary/20 my-8" />

        <div className="grid sm:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary">Radera konto</h2>
            <p className="mt-2 text-primary/70">
              Vill du inte längre vara en medlem hos Planago? I så fall kan du
              radera ditt konto här.
              <br />
              Denna åtgärd går inte att ta tillbaka. Alla dina sparade resplaner
              kommer att bli raderade permanent.
            </p>
          </div>
          <div className="flex items-end sm:justify-start">
            <div className="flex items-end sm:justify-start">
              <button
                type="button"
                onClick={() => setOpenDeleteDialog(true)}
                className="rounded-md bg-accent px-4 py-2 text-accent-foreground shadow hover:bg-accent/90"
              >
                Ja, jag vill radera mitt konto
              </button>
            </div>

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
                        Radera konto
                      </DialogTitle>
                      <p className="mt-2 text-sm text-primary/70">
                        Är du säker på att du vill radera ditt konto? All data
                        tas bort permanent.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Form method="post" className="w-full sm:w-auto">
                      <input
                        type="hidden"
                        name="intent"
                        value="deleteAccount"
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
                </DialogPanel>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </main>
  );
}
