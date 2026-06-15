/** Shared SWR fetcher. */
export async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const message = `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return (await res.json()) as T;
}
