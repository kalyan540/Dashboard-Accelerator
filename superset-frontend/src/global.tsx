// globalState.ts
let globalIdOrSlug = '';

export const setGlobalIdOrSlug = (value: string) => {
  globalIdOrSlug = value;
};

export const getGlobalIdOrSlug = () => {
  return globalIdOrSlug;
};
