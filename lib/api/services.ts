import { services } from "@/lib/data/services";
import type { Service, ServiceLocationType, ServiceType } from "@/lib/types";

export interface ServiceFilters {
  vendorId?: string;
  serviceType?: ServiceType;
  locationType?: ServiceLocationType;
}

export async function getServices(filters: ServiceFilters = {}): Promise<Service[]> {
  let results = services.filter((s) => s.status === "published");
  if (filters.vendorId) results = results.filter((s) => s.vendorId === filters.vendorId);
  if (filters.serviceType) results = results.filter((s) => s.serviceType === filters.serviceType);
  if (filters.locationType) {
    results = results.filter((s) =>
      matchesLocation(s.locationType, filters.locationType!),
    );
  }
  return results;
}

export async function getService(id: string): Promise<Service | null> {
  return services.find((s) => s.id === id) ?? null;
}

// `both` services match either virtual or in-person filters; an exact filter
// also matches itself.
function matchesLocation(
  serviceLocation: ServiceLocationType,
  filter: ServiceLocationType,
): boolean {
  if (filter === "unknown") return true;
  if (serviceLocation === "both") return filter === "virtual" || filter === "in_person" || filter === "both";
  return serviceLocation === filter;
}
