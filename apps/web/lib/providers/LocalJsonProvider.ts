export type LocalPhageRecord = {
  id: string;
  name: string;
  host_species: string | null;
  lifecycle: "lytic" | "temperate" | null;
  source_url: string;
  taxonomy: string | null;
  completeness: string | null;
  length_kb: number | null;
  gc_content: number | null;
  cluster: string | null;
  subcluster: string | null;
};

async function fetchJson(path: string): Promise<LocalPhageRecord[]> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${response.status}: ${path}`);
  }
  return response.json();
}

export async function loadLocalPhages(): Promise<LocalPhageRecord[]> {
  try {
    return await fetchJson('/data/phagescope.json');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('404:')) {
      return fetchJson('/data/phages.sample.json');
    }
    throw error;
  }
}
