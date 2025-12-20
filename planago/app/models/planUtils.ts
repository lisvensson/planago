import { activityTypeMapping, timeFrames, type TimeFrame } from "./planConfig";

export function mapActivityTypes(activityTypes: string[]): string[] {
  return activityTypes.flatMap((type) => activityTypeMapping[type] || [type]);
}

export async function geocodeCity(city: string, apiKey: string) {
  const query = `${city}, Sweden`;

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query
    )}&key=${apiKey}`
  );

  const data = await res.json();

  if (!data.results?.length) return null;

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

export function mapPlaceToCategory(place: any): "food" | "activity" {
  const type = place.types || [];
  return type.some((x: string) => ["restaurant", "cafe", "bar"].includes(x))
    ? "food"
    : "activity";
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getSelectedTimeFrame(timeFrame: string): TimeFrame {
  return ["Heldag", "Halvdag (förmiddag)", "Halvdag (eftermiddag)"].includes(
    timeFrame
  )
    ? (timeFrame as TimeFrame)
    : "Heldag";
}

export function generatePlan(places: any[], selectedTimeFrame: TimeFrame) {
  const buckets: Record<"food" | "activity", any[]> = {
    food: [],
    activity: [],
  };

  for (const place of places) {
    const category = mapPlaceToCategory(place);
    buckets[category].push(place);
  }

  buckets.food = shuffleArray(buckets.food);
  buckets.activity = shuffleArray(buckets.activity);

  return timeFrames[selectedTimeFrame]
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
