export function extractRoleName(role: unknown): string | null {
  if (Array.isArray(role)) {
    const firstRole = role[0];

    if (
      firstRole &&
      typeof firstRole === "object" &&
      "name" in firstRole &&
      typeof firstRole.name === "string"
    ) {
      return firstRole.name;
    }

    return null;
  }

  if (role && typeof role === "object" && "name" in role && typeof role.name === "string") {
    return role.name;
  }

  return null;
}
