PromptNotebook.services.storage = {
  read() {
    const content = localStorage.getItem('local_readme_content');
    return content ? { content, filename: localStorage.getItem('local_readme_filename') || '', updated: localStorage.getItem('local_readme_updated') || '' } : null;
  },
  write(content, filename) {
    localStorage.setItem('local_readme_content', content);
    localStorage.setItem('local_readme_filename', filename);
    localStorage.setItem('local_readme_updated', new Date().toLocaleString());
  },
  clear() {
    localStorage.removeItem('local_readme_content');
    localStorage.removeItem('local_readme_filename');
    localStorage.removeItem('local_readme_updated');
  }
};
