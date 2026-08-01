export interface Pillar {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface ValueConfig {
  active: boolean;
  symbol: string;
  target: number;
}

export interface DisciplineConfig {
  threshold: number;
  message: string;
}

export interface ExportConfig {
  template: string;
}
