import { useSearchParams } from "react-router-dom";

export type MeetingMode = "host" | "join" | "watch";

export const useMeetingMode = (): MeetingMode => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "join";

  // Validate mode parameter
  if (mode === "host" || mode === "join" || mode === "watch") {
    return mode;
  }

  // Default to 'join' if invalid mode provided
  return "join";
};

export const useMeetingCode = (): string | null => {
  const [searchParams] = useSearchParams();
  return searchParams.get("code");
};

export const getRoleFromMode = (
  mode: MeetingMode
): { isFacilitator: boolean; isWatcher: boolean } => {
  switch (mode) {
    case "host":
      return { isFacilitator: true, isWatcher: false };
    case "join":
      return { isFacilitator: false, isWatcher: false };
    case "watch":
      return { isFacilitator: false, isWatcher: true };
    default:
      return { isFacilitator: false, isWatcher: false };
  }
};

export const getModeFromRole = (
  isFacilitator: boolean,
  isWatcher: boolean
): MeetingMode => {
  if (isFacilitator) return "host";
  if (isWatcher) return "watch";
  return "join";
};
