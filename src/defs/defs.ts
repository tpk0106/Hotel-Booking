export const SLASH = "/";
export const ASSETS_FOLDER_LENGTH = 10;

export type menuItem = {
  subMenus: string[] | null;
  icon: string;
  label: string;
  routerLink: string;
  // menuClick: (e: MouseEvent) => {};
};

export type Item = {
  icon: string;
  label: string;
  routerLink: string;
};
