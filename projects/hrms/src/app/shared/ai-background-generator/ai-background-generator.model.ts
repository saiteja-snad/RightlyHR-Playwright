export interface BackgroundTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  prompt: string;
}

export interface GeneratedVariation {
  id: string;
  url: string;
  label: string;
  selected: boolean;
}
