import { Form, useSearchParams } from "react-router";
import type { Route } from "./+types/PlanagoFilter";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const filterOptions = {
    locations: ["Eskilstuna", "Linköping", "Stockholm", "Uppsala", "Örebro"],
    activityTypes: ["Museum", "Natur", "Mat & Dryck", "Barnvänligt"],
    timeFrames: ["Heldag", "Halvdag", "Kväll"],
  };

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const location = searchParams.get("location");
  const activityTypes = searchParams.getAll("activityType");
  const timeFrame = searchParams.get("timeFrame");

  const filters = {
    location: location,
    activityTypes: activityTypes,
    timeFrame: timeFrame,
  };

  return { filterOptions, result: filters };
}

export default function PlanagoFilter({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const { filterOptions, result } = loaderData;
  console.log(result);
  const [error, setError] = useState<string | null>(null);

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
              setError("Du måste välja minst en aktivitetstyp");
            } else {
              setError(null);
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
              className="w-full rounded-md bg-background px-3 py-2 sm:px-4 sm:py-3 text-primary outline outline-1 outline-primary/30 focus:outline-2 focus:outline-primary"
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
              error ? "border-accent" : "border-primary/30"
            }`}
          >
            <legend className="text-sm sm:text-base font-medium text-primary mb-2">
              Aktivitetstyp
            </legend>

            {error && (
              <p className="mt-1 text-sm text-accent flex items-center gap-1">
                {error}
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
              className="w-full rounded-md bg-background px-3 py-2 sm:px-4 sm:py-3 text-primary outline outline-1 outline-primary/30 focus:outline-2 focus:outline-primary"
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
      </div>
    </div>
  );
}
