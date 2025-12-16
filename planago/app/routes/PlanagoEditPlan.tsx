import { db } from "~/shared/database";
import type { Route } from "./+types/PlanagoEditPlan";
import { plan } from "~/shared/database/schema";
import { eq, and } from "drizzle-orm";
import { Form, redirect } from "react-router";
import { useEffect, useState } from "react";
import { userSessionContext } from "~/context/userSessionContext";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userSession = context.get(userSessionContext);
  if (!userSession) {
    throw new Response("Not authenticated", { status: 401 });
  }

  const userId = userSession.user.id;
  const { planId } = params;

  const existing = await db
    .select()
    .from(plan)
    .where(and(eq(plan.id, planId), eq(plan.userId, userId)))
    .limit(1);

  if (!existing.length) {
    throw new Response(
      "Planen kunde inte hittas eller du har inte behörighet",
      { status: 404 }
    );
  }

  const currentPlan = existing[0];

  const filterOptions = {
    locations: ["Eskilstuna", "Linköping", "Stockholm", "Uppsala", "Örebro"],
    activityTypes: [
      "Museum",
      "Natur",
      "Mat & Dryck",
      "Barnvänligt",
      "Shopping",
      "Sport",
      "Kultur",
    ],
    timeFrames: ["Heldag", "Halvdag (förmiddag)", "Halvdag (eftermiddag)"],
  };

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const location = searchParams.get("location") ?? currentPlan.location;
  const activityTypes =
    searchParams.getAll("activityType").length > 0
      ? searchParams.getAll("activityType")
      : (currentPlan.activityTypes ?? []);
  const timeFrame = searchParams.get("timeFrame") ?? currentPlan.timeFrame;

  let generatedPlan: any[] = [];
  let error: string | null = null;

  const activityTypeMapping: Record<string, string[]> = {
    Barnvänligt: [
      "lekland",
      "djurpark",
      "nöjespark",
      "bad",
      "inomhuslek",
      "familjeaktivitet",
    ],
    Natur: ["park", "natur", "reservat", "promenad"],
    "Mat & Dryck": ["restaurang", "cafe", "bageri", "bar"],
    Shopping: ["shopping", "galleria", "kläder"],
    Sport: ["sport", "gym", "bowling", "simhall"],
    Kultur: ["museum", "teater", "bibliotek", "konst"],
  };

  const mapPlaceToCategory = (place: any) => {
    const type = place.types || [];
    if (type.some((x: string) => ["restaurant", "cafe", "bar"].includes(x)))
      return "food";
    return "activity";
  };

  type TimeFrame = "Heldag" | "Halvdag (förmiddag)" | "Halvdag (eftermiddag)";
  const timeFrames: Record<
    TimeFrame,
    { time: string; type: "food" | "activity" }[]
  > = {
    Heldag: [
      { time: "10:00", type: "activity" },
      { time: "12:30", type: "food" },
      { time: "14:00", type: "activity" },
      { time: "18:00", type: "food" },
    ],
    "Halvdag (förmiddag)": [
      { time: "10:00", type: "activity" },
      { time: "12:00", type: "food" },
    ],
    "Halvdag (eftermiddag)": [
      { time: "14:00", type: "activity" },
      { time: "17:00", type: "food" },
    ],
  };

  const selectedTimeFrame: TimeFrame =
    timeFrame === "Heldag" ||
    timeFrame === "Halvdag (förmiddag)" ||
    timeFrame === "Halvdag (eftermiddag)"
      ? timeFrame
      : "Heldag";

  if (location && activityTypes.length > 0) {
    const mappedTypes: string[] = [];
    for (const type of activityTypes) {
      mappedTypes.push(...(activityTypeMapping[type] || [type]));
    }

    const query = `${mappedTypes.join(" ")} in ${location}`;
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.googleMapsUri,places.types,places.id",
          },
          body: JSON.stringify({ textQuery: query }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        error = `Fel vid sökning (status: ${response.status})`;
      } else if (!data.places || data.places.length === 0) {
        error = "Inga platser matchade dina filter.";
      } else {
        const places = data.places;

        function shuffle<T>(arr: T[]): T[] {
          const copy = [...arr];
          for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
          }
          return copy;
        }

        const buckets: Record<"food" | "activity", any[]> = {
          food: [],
          activity: [],
        };
        for (const place of places) {
          const category = mapPlaceToCategory(place);
          buckets[category].push(place);
        }

        buckets.food = shuffle(buckets.food);
        buckets.activity = shuffle(buckets.activity);

        const frame = timeFrames[selectedTimeFrame];
        generatedPlan = frame
          .map((slot) => {
            const pool = buckets[slot.type];
            if (!pool?.length) return null;
            const place = pool.shift();
            return {
              time: slot.time,
              name: place.displayName?.text,
              address: place.formattedAddress,
              link: place.googleMapsUri,
              category: slot.type,
            };
          })
          .filter(Boolean);
      }
    } catch (error: any) {
      console.error("Loader error:", error);
      error = error.message || "Något gick fel vid hämtning.";
    }
  }

  return { filterOptions, plan: currentPlan, generatedPlan, error };
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

    if (intent === "update") {
      const location = formData.get("location") as string;
      const timeFrame = formData.get("timeFrame") as string;
      const activityTypes = formData.getAll("activityType") as string[];
      const activities = JSON.parse(formData.get("plan") as string);

      await db
        .update(plan)
        .set({
          location,
          timeFrame,
          activityTypes,
          activities,
          updatedAt: new Date(),
        })
        .where(and(eq(plan.id, params.planId), eq(plan.userId, userId))); // <-- checka ägare

      return redirect(`/planago/plan/${params.planId}`);
    }

    if (intent === "cancel") {
      return redirect(`/planago/plan/${params.planId}`);
    }
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return { error: "Det gick inte att uppdatera din resplan." };
  }
}

export default function PlanagoEditPlan({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    filterOptions,
    plan: currentPlan,
    generatedPlan: initialPlan,
    error,
  } = loaderData;
  const [plan, setPlan] = useState(initialPlan ?? []);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  useEffect(() => {
    setPlan(initialPlan ?? []);
  }, [initialPlan]);

  const hasPlan = plan && plan.length > 0;

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
          Uppdatera din utflykt
        </h1>
        <p className="text-sm sm:text-base text-primary/75 mb-6">
          Välj vad du vill göra och uppdatera sedan din resplan.
        </p>

        <Form
          className="space-y-6 sm:space-y-8 lg:space-y-10 text-left"
          onSubmit={(e) => {
            const checkboxes =
              e.currentTarget.querySelectorAll<HTMLInputElement>(
                'input[name="activityType"]'
              );
            const anyChecked = Array.from(checkboxes).some((c) => c.checked);
            if (!anyChecked) {
              e.preventDefault();
              setErrorForm("Du måste välja minst en aktivitetstyp");
            } else {
              setErrorForm(null);
            }
          }}
        >
          <fieldset className="border border-primary/30 rounded-md p-4">
            <legend className="text-sm sm:text-base font-medium text-primary mb-2">
              Plats
            </legend>
            <select
              name="location"
              required
              defaultValue={currentPlan.location ?? ""}
              className="w-full rounded-md bg-background px-3 py-2 sm:px-4 sm:py-3 text-primary text-sm sm:text-base outline outline-1 outline-primary/30 focus:outline-2 focus:outline-primary"
            >
              <option value="">Välj område</option>
              {filterOptions.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset
            className={`border rounded-md p-4 ${
              errorForm ? "border-accent" : "border-primary/30"
            }`}
          >
            <legend className="text-sm sm:text-base font-medium text-primary mb-2">
              Aktivitetstyp
            </legend>
            {errorForm && (
              <p className="mt-1 text-sm text-accent flex items-center gap-1">
                {errorForm}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {filterOptions.activityTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-primary cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="activityType"
                    value={type}
                    defaultChecked={currentPlan.activityTypes?.includes(type)}
                    className="rounded border-primary/30 text-primary focus:ring-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="border border-primary/30 rounded-md p-4">
            <legend className="text-sm sm:text-base font-medium text-primary mb-2">
              Tidsram
            </legend>
            <select
              name="timeFrame"
              required
              defaultValue={currentPlan.timeFrame ?? ""}
              className="w-full rounded-md bg-background px-3 py-2 sm:px-4 sm:py-3 text-primary text-sm sm:text-base outline outline-1 outline-primary/30 focus:outline-2 focus:outline-primary"
            >
              <option value="">Välj tidsram</option>
              {filterOptions.timeFrames.map((frame) => (
                <option key={frame} value={frame}>
                  {frame}
                </option>
              ))}
            </select>
          </fieldset>

          {hasPlan && (
            <input type="hidden" name="plan" value={JSON.stringify(plan)} />
          )}

          <button
            type="submit"
            name="intent"
            value="regenerate"
            formMethod="get"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
          >
            Skapa uppdaterad resplan
          </button>

          {error && (
            <div className="mt-4 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
              {error}
            </div>
          )}

          {hasPlan && (
            <div className="mt-10 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6">
                Din nya resplan
              </h2>

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
                    {plan.map((item: any) => (
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

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="update"
                  formMethod="post"
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
                >
                  Uppdatera resplan
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="cancel"
                  formMethod="post"
                  className="flex-1 rounded-md bg-accent px-4 py-2 text-accent-foreground shadow hover:bg-accent/90"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </Form>

        {actionData?.error && (
          <div className="mt-6 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {actionData.error}
          </div>
        )}
      </div>
    </div>
  );
}
