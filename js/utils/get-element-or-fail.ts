export const getByIdOrFail = <T>(id: string) => {
  const element = <T>document.getElementById(id);

  if (!element) throw new Error(`Element with id ${id} not found`);

  return element;
};
