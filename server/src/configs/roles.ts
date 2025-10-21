const allRoles: Record<any, string[]> = {
  USER: [],
  SUPER_ADMIN: ["getUsers", "manageUsers", "getProducts", "manageProducts", "manageAds"],
  ADMIN: ["getProducts", "manageProducts", "manageAds"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
