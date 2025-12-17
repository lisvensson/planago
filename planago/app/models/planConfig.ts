export const filterOptions = {
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

export const activityTypeMapping: Record<string, string[]> = {
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

export type TimeFrame =
  | "Heldag"
  | "Halvdag (förmiddag)"
  | "Halvdag (eftermiddag)";

export const timeFrames: Record<
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
