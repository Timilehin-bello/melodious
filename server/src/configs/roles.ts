const allRoles: Record<any, string[]> = {
  USER: [],
  SUPER_ADMIN: ["getUsers", "manageUsers", "getProducts", "manageProducts"],
  ADMIN: ["getProducts", "manageProducts"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
