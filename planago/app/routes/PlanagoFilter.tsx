import { Form, redirect, useSearchParams } from "react-router";
import type { Route } from "./+types/PlanagoFilter";
import { useEffect, useState } from "react";
import { userSessionContext } from "~/context/userSessionContext";
import { db } from "~/shared/database";
import { plan } from "~/shared/database/schema";

export async function loader({ request }: Route.LoaderArgs) {
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

  const location = searchParams.get("location");
  const activityTypes = searchParams.getAll("activityType");
  const timeFrame = searchParams.get("timeFrame");

  let places: any[] = [];
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
              "places.displayName,places.formattedAddress,places.googleMapsUri,places.regularOpeningHours,places.rating,places.types,places.id",
          },
          body: JSON.stringify({ textQuery: query }),
        }
      );

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 400) {
          error =
            "Din sökning kunde inte behandlas. Kontrollera dina val och försök igen.";
        } else if (response.status === 429) {
          error =
            "För många förfrågningar just nu. Vänta en stund och försök igen.";
        } else {
          error = `Ett oväntat fel inträffade (status: ${response.status}). Försök igen.`;
        }
      } else if (data.error) {
        error = data.error.message || "Okänt API-fel";
      } else if (!data.places || data.places.length === 0) {
        error = "Inga platser matchade dina filter. Prova att ändra sökningen.";
      } else {
        places = data.places;

        function shuffleGeneratedPlan<T>(array: T[]): T[] {
          const plan = [...array];
          for (let i = plan.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [plan[i], plan[j]] = [plan[j], plan[i]];
          }
          return plan;
        }

        const buckets: Record<"food" | "activity", any[]> = {
          food: [],
          activity: [],
        };

        for (const place of places) {
          const category = mapPlaceToCategory(place);
          buckets[category].push(place);
        }

        buckets.food = shuffleGeneratedPlan(buckets.food);
        buckets.activity = shuffleGeneratedPlan(buckets.activity);

        const frame = timeFrames[selectedTimeFrame];
        generatedPlan = frame
          .map((slot: { time: string; type: "food" | "activity" }) => {
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

  return { filterOptions, generatedPlan, error };
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const location = formData.get("location") as string;
    const activityTypes = formData.getAll("activityType") as string[];
    const timeFrame = formData.get("timeFrame") as string;
    const planJson = formData.get("plan") as string;

    const userSession = context.get(userSessionContext);
    if (!userSession || !userSession.user) {
      throw new Response("Not authorized", { status: 401 });
    }

    const userId = userSession.user.id;
    const parsedPlan = JSON.parse(planJson);
    const newId = crypto.randomUUID();

    await db.insert(plan).values({
      id: newId,
      userId,
      title: `Resplan för utflykt till ${location}`,
      location,
      activityTypes,
      timeFrame,
      activities: parsedPlan,
      createdAt: new Date(),
    });

    return redirect(`/planago/plan/${newId}`);
  } catch (error: any) {
    console.error("Error saving plan:", error);
    return { error: "Det gick inte att spara din resplan." };
  }
}

export default function PlanagoFilter({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const { filterOptions, generatedPlan: initialPlan, error } = loaderData;
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [plan, setPlan] = useState(initialPlan ?? []);

  useEffect(() => {
    setPlan(initialPlan ?? []);
  }, [initialPlan]);

  const hasPlan = plan && plan.length > 0;

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        {!hasPlan && (
          <>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              Planera din utflykt
            </h1>
            <p className="text-sm sm:text-base text-primary/75 mb-6">
              Välj vad du vill göra och skapa sedan din resplan.
            </p>
          </>
        )}

        {!hasPlan && (
          <Form
            method="get"
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
                defaultValue={searchParams.get("location") ?? ""}
                className="w-full rounded-md bg-background px-3 py-2 sm:px-4 sm:py-3 text-primary text-sm sm:text-base outline outline-1 outline-primary/30 focus:outline-2 focus:outline-primary"
              >
                <option value="">Välj område</option>
                {filterOptions.locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
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
                    className="flex items-center gap-2 text-primary text-sm sm:text-base cursor-pointer hover:bg-primary/5 rounded-md px-2 py-1 transition"
                  >
                    <input
                      type="checkbox"
                      name="activityType"
                      value={type}
                      defaultChecked={searchParams.has(
                        "activityType",
                        String(type)
                      )}
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
                defaultValue={searchParams.get("timeFrame") ?? ""}
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

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow hover:bg-primary/90"
            >
              Skapa resplan
            </button>
          </Form>
        )}

        {error && (
          <div className="mt-4 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {error}
          </div>
        )}

        {hasPlan && (
          <div className="mt-10 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6">
              Din resplan
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

            <Form
              method="post"
              className="mt-6 flex flex-col sm:flex-row gap-3"
            >
              <input
                type="hidden"
                name="location"
                value={searchParams.get("location") ?? ""}
              />
              {searchParams.getAll("activityType").map((type) => (
                <input
                  key={type}
                  type="hidden"
                  name="activityType"
                  value={type}
                />
              ))}
              <input
                type="hidden"
                name="timeFrame"
                value={searchParams.get("timeFrame") ?? ""}
              />
              <input type="hidden" name="plan" value={JSON.stringify(plan)} />
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90"
              >
                Spara resplan
              </button>
              <button
                type="button"
                onClick={() => setPlan([])}
                className="flex-1 rounded-md bg-accent px-4 py-2 text-primary-foreground shadow hover:bg-accent/90"
              >
                Skapa ny resplan
              </button>
            </Form>
          </div>
        )}

        {actionData?.error && (
          <div className="mt-6 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {actionData.error}
          </div>
        )}
      </div>
    </div>
  );
}
