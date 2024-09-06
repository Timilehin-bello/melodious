const objectId = (value: string, helpers: any) => {
  if (!value.match(/^[0-9a-fA-F]/)) {
    return helpers.message('"{{#label}}" must be a valid Prisma id');
  }
  return value;
};

export { objectId };
