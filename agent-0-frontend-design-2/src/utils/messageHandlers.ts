export const isLandingPage = (path: string): boolean => {
  return path === "/" || path === "/index" || path.endsWith("/index.html");
};

export interface MessageData {
  type: string;
  data?: {
    title?: string;
    path?: string;
  };
  message?: string;
}

export interface ContextItem {
  title: string;
  path: string;
}

export const shouldSuggestContext = (
  currentContext: ContextItem[],
  path: string,
  isNewPath: boolean = true
): boolean => {
  if (isLandingPage(path)) return false;
  if (currentContext.length > 0) return false;
  if (!isNewPath) return false;
  
  const alreadyInContext = currentContext.some((item) => item.path === path);
  return !alreadyInContext;
};

