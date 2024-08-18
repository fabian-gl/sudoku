export const fetchHelper = async (url: string) => {
  const response = await fetch(url);

  if (!response || !response.ok) {
    const message = `Request failed wuth status code ${response.status}`;
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error('Unexpected non-json response');
  }
};
