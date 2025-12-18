import { Form, redirect, useSearchParams } from "react-router";
import type { Route } from "./+types/PlanagoFilter";
import { useEffect, useState } from "react";
import { userSessionContext } from "~/context/userSessionContext";
import { db } from "~/shared/database";
import { plan } from "~/shared/database/schema";
import { filterOptions } from "~/models/planConfig";
import {
  generatePlan,
  getSelectedTimeFrame,
  mapActivityTypes,
} from "~/models/planUtils";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const location = searchParams.get("location");
  const activityTypes = searchParams.getAll("activityType");
  const timeFrame = searchParams.get("timeFrame");

  let generatedPlan: any[] = [];
  let error: string | null = null;

  if (location && activityTypes.length > 0) {
    const mappedTypes = mapActivityTypes(activityTypes);

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
        generatedPlan = generatePlan(
          data.places,
          getSelectedTimeFrame(timeFrame ?? "Heldag")
        );
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
      <div className="mx-auto max-w-5xl space-y-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
          Planera din utflykt
        </h1>
        <p className="text-sm sm:text-base text-primary/75 mb-6">
          Välj vad du vill göra och skapa sedan din resplan.
        </p>

        <Form
          method="get"
          className="space-y-10 text-left"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                <i className="fa-solid fa-map-location-dot"></i>
              </span>
              <select
                name="location"
                required
                defaultValue={searchParams.get("location") ?? ""}
                className="w-full rounded-lg bg-background pl-10 pr-10 py-3 text-primary text-sm sm:text-base border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/40 transition appearance-none"
              >
                <option value="">Välj plats</option>
                {filterOptions.locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/60">
                <i className="fa-solid fa-chevron-down"></i>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                <i className="fa-solid fa-clock"></i>
              </span>
              <select
                name="timeFrame"
                required
                defaultValue={searchParams.get("timeFrame") ?? ""}
                className="w-full rounded-lg bg-background pl-10 pr-10 py-3 text-primary text-sm sm:text-base border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/40 transition appearance-none"
              >
                <option value="">Välj tidsram</option>
                {filterOptions.timeFrames.map((frame) => (
                  <option key={frame} value={frame}>
                    {frame}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/60">
                <i className="fa-solid fa-chevron-down"></i>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-primary">
              Aktivitetstyp
            </h3>
            {errorForm && (
              <p className="text-sm text-accent flex items-center gap-1">
                {errorForm}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filterOptions.activityTypes.map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="activityType"
                    value={type}
                    defaultChecked={searchParams.has(
                      "activityType",
                      String(type)
                    )}
                    className="peer hidden"
                  />
                  <div
                    className="flex items-center justify-center gap-2 rounded-lg bg-background border border-primary/20 px-3 py-2 transition 
                      peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary peer-checked:font-semibold"
                  >
                    <span>{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {!hasPlan && (
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <button
                type="submit"
                className="w-full md:w-auto flex-1 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition"
              >
                Skapa resplan
              </button>

              <button
                type="reset"
                onClick={() => {
                  setErrorForm(null);
                }}
                className="w-full md:w-auto flex-1 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg transition"
              >
                Rensa filter
              </button>
            </div>
          )}
        </Form>

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
