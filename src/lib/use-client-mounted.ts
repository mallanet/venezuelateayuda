import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

export function useClientMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function useHasGeolocation() {
  return useSyncExternalStore(
    subscribeNoop,
    () => typeof navigator !== "undefined" && !!navigator.geolocation,
    () => false
  );
}
