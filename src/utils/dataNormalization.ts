import { ServeAttemptData } from "@/components/ServeAttempt";
import { ClientData } from "@/components/ClientForm";

/**
 * Normalize serve data from any format to the standard ServeAttemptData format
 * This handles conversion between snake_case, camelCase, and Appwrite document formats
 */
export function normalizeServeData(serve: any): ServeAttemptData | null {
  if (!serve) return null;

  // Use $id if available; otherwise use id
  const id = serve.$id || serve.id;
  if (!id) {
    // Instead of logging an error, warn and skip this record
    console.warn("Skipping serve data without an ID:", serve);
    return null;
  }

  return {
    id,
    clientId: serve.clientId || serve.client_id || "unknown",
    clientName: serve.clientName || serve.client_name || "Unknown Client",
    caseNumber: serve.caseNumber || serve.case_number || "Unknown",
    caseName: serve.caseName || serve.case_name || "Unknown Case",
    coordinates: serve.coordinates || null,
    notes: serve.notes || "",
    status: serve.status || "unknown",
    timestamp: serve.timestamp ? new Date(serve.timestamp) : new Date(),
    attemptNumber: serve.attemptNumber || serve.attempt_number || 1,
    imageData: serve.imageData || serve.image_data || null,
  };
}

/**
 * Normalize an array of serve data objects
 */
export function normalizeServeDataArray(serves: any[]) {
  return serves
    .map((serve) => normalizeServeData(serve))
    .filter((serve) => serve !== null);
}

/**
 * Adds client names to serve attempts based on clientId
 */
export function addClientNamesToServes(serves: ServeAttemptData[], clients: ClientData[]): ServeAttemptData[] {
  if (!serves || !clients || !Array.isArray(serves) || !Array.isArray(clients)) {
    return serves || [];
  }

  return serves.map(serve => {
    // Skip if serve already has a client name
    if (serve.clientName && serve.clientName !== "Unknown Client") {
      return serve;
    }

    // Find matching client - check both id and $id properties
    const client = clients.find(c => {
      // Handle both ClientData and raw Appwrite document formats
      const clientId = c.id || (c as any).$id;
      return clientId === serve.clientId;
    });
    
    // Return updated serve with client name if found
    if (client) {
      return {
        ...serve,
        clientName: client.name
      };
    }
    
    return serve;
  });
}
