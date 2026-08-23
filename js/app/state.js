let rawMarkdown = "";
let parsedItems = [];
PromptNotebook.app.state = {
  get rawMarkdown() { return rawMarkdown; },
  get parsedItems() { return parsedItems; }
};
