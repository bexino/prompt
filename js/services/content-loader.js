PromptNotebook.services.loadContent = async function loadContent(site) {
  const response = await fetch(site.path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
};
