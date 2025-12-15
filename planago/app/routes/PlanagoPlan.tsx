import { db } from "~/shared/database";
import type { Route } from "./+types/PlanagoPlan";
import { plan } from "~/shared/database/schema";
import { eq } from "drizzle-orm";
import { Form, redirect, useNavigate } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const { planId } = params;

    const result = await db
      .select()
      .from(plan)
      .where(eq(plan.id, planId))
      .limit(1);

    if (!result.length) {
      throw new Response("Planen kunde inte hittas", { status: 404 });
    }

    return { plan: result[0] };
  } catch (error: any) {
    console.error("Loader error:", error);
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Ett oväntat fel inträffade vid hämtning av resplanen", {
      status: 500,
    });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
      await db.delete(plan).where(eq(plan.id, params.planId));
    }

    return redirect("/account/saved-plans");
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl text-center">
        <div className="mt-10 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-8">
            Resplan för utflykt till {plan.location}
          </h2>

          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-background border border-primary/20 rounded-lg">
              <thead className="bg-primary/10">
                <tr>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary">
                    Tid
                  </th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary">
                    Plats
                  </th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary">
                    Adress
                  </th>
                  <th className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary">
                    Hitta hit
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.activities.map((item: any) => (
                  <tr
                    key={item.link}
                    className="border-t border-primary/10 hover:bg-primary/5 transition"
                  >
                    <td className="px-3 py-2 text-primary font-medium text-xs sm:text-sm">
                      {item.time}
                    </td>
                    <td className="px-3 py-2 text-primary text-xs sm:text-sm">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-primary text-xs sm:text-sm">
                      {item.address}
                    </td>
                    <td className="px-3 py-2 text-xs sm:text-sm">
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
              onClick={() => navigate(`/planago/edit-plan/${plan.id}`)}
            >
              Redigera resplan
            </button>
            <button
              type="submit"
              name="intent"
              value="delete"
              className="flex-1 rounded-md bg-accent px-4 py-2 text-primary-foreground shadow hover:bg-accent/90"
            >
              Radera resplan
            </button>
          </Form>
        </div>
        {actionData?.error && (
          <div className="mt-6 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {actionData.error}
          </div>
        )}
      </div>
    </div>
  );
}
