import type { PhageProvider } from "./PhageProvider";
import { LocalJsonProvider } from "./LocalJsonProvider";

export function getProvider(): PhageProvider {
  return new LocalJsonProvider();
}

export type { PhageCandidate, PhageProvider } from "./PhageProvider";
