export interface NavLink {
  label: string;
  route: string;
  status: string;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}