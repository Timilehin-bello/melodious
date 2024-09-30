const objectId = (value: string, helpers: any) => {
  if (!value.match(/^[0-9a-fA-F]/)) {
    return helpers.message('"{{#label}}" must be a valid Prisma id');
  }
  return value;
};

const ethAddress = (value: string, helpers: any) => {
  const regex = new RegExp("^0x[a-fA-F0-9]{40}$");
  if (!value.match(regex)) {
    return helpers.message(
      '"{{#label}}" must be a valid Ethereum wallet address'
    );
  }
  return value;
};

export { objectId, ethAddress };
