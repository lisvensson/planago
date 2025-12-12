import { Form, useSearchParams } from "react-router";
import type { Route } from "./+types/PlanagoFilter";
import { useState } from "react";

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
    timeFrames: ["Heldag", "Halvdag", "Kväll"],
  };

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const location = searchParams.get("location");
  const activityTypes = searchParams.getAll("activityType");
  const timeFrame = searchParams.get("timeFrame");

  const filters = { location, activityTypes, timeFrame };

  let plan: any[] = [];
  let error: string | null = null;

  const activityTypeMapping: Record<string, string[]> = {
    Barnvänligt: [
      "barnvänligt",
      "djurpark",
      "nöjespark",
      "äventyrsbad",
      "badhus",
      "leos lekland",
      "lekpark",
      "barnaktivitet",
    ],
    Natur: [
      "natur",
      "park",
      "nationalpark",
      "naturreservat",
      "promenadstråk",
      "vandringsled",
      "botanisk park",
    ],
    "Mat & Dryck": [
      "mat & dryck",
      "restaurang",
      "fika",
      "bageri",
      "drink",
      "bar",
    ],
    Shopping: ["shopping", "galleria", "shoppingcenter", "klädbutik"],
    Sport: [
      "sport",
      "skidåkning",
      "utegym",
      "simning",
      "gym",
      "ridning",
      "skridskor",
      "träning",
      "hälsa",
    ],
    Kultur: ["kultur", "teater", "bibliotek", "konsert", "bio"],
  };

  if (location && activityTypes.length > 0) {
    const mappedTypes: string[] = [];
    for (const type of activityTypes) {
      const mapped = activityTypeMapping[type] || [type];
      mappedTypes.push(...mapped);
    }

    console.log(mappedTypes);

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
              "places.displayName,places.formattedAddress,places.googleMapsUri,places.regularOpeningHours,places.rating,places.id",
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
        plan = data.places;
      }
    } catch (error: any) {
      console.error("Loader error:", error);
      error = error.message || "Något gick fel vid hämtning av platser.";
    }
  }

  return { filterOptions, result: filters, plan, error };
}

export default function PlanagoFilter({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const { filterOptions, result, plan, error } = loaderData;
  console.log(result);
  console.log(plan);
  console.log(error);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
          Planera din utflykt
        </h1>
        <p className="text-sm sm:text-base text-primary/75 mb-6">
          Välj vad du vill göra och skapa sedan din utflykt.
        </p>

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
            Skapa utflykt
          </button>
        </Form>
        {plan && plan.length > 0 && (
          <div className="mt-10 text-left">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Förslag på platser
            </h2>
            <ul className="space-y-2 text-primary">
              {loaderData.plan.map((place) => (
                <li key={place.id}>
                  <span className="font-medium">{place.displayName?.text}</span>{" "}
                  – {place.formattedAddress}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded bg-accent/10 text-accent text-sm sm:text-base">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
