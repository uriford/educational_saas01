export function serializePaymentData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (data instanceof Date) {
    return new Date(data.getTime()) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      serializePaymentData(item),
    ) as T;
  }

  const object = data as unknown as Record<string, unknown>;

  if (typeof object.toNumber === "function") {
    return Number(
      (object.toNumber as () => number)(),
    ) as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(object)) {
    result[key] = serializePaymentData(value);
  }

  return result as T;
}
