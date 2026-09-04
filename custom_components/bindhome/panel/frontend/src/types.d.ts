export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  code?: string | null;
  area_id?: string | null;
  capabilities?: string[];
}
export interface Relation {
  id: string;
  source_asset_id: string;
  target_asset_id: string;
  relation_type: string;
}
export interface Binding {
  id: string;
  asset_id: string;
  capability: string;
  entity_id: string;
  role: string;
}
export interface Representation {
  id?: string;
  asset_id: string;
  platform: string;
  capability?: string;
  entity_id?: string;
}
export interface BindingStatus {
  asset_id: string;
  capability: string;
  role: string;
  status: string;
  config_valid?: boolean;
  runtime_available?: boolean;
  entity_id?: string;
  binding?: Binding;
}
export interface CreationPreset {
  preset_id: string;
  group: string;
  asset_type: string;
  default_name: string;
  suggested_capabilities: string[];
}
export interface HaFloor {
  floor_id: string;
  name: string;
  level: number | null;
  icon: string | null;
}
export interface HaArea {
  area_id: string;
  name: string;
  floor_id: string | null;
  icon: string | null;
}
export interface HaEntityRegistryEntry {
  entity_id: string;
  name?: string | null;
  original_name?: string | null;
  device_id?: string | null;
  area_id?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
}
export interface HaDeviceRegistryEntry {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  area_id?: string | null;
}
export interface Registry {
  assets: Asset[];
  relations: Relation[];
  bindings: Binding[];
  representations: Representation[];
}
export interface HomeAssistant {
  callWS(message: Record<string, unknown>): Promise<any>;
  language?: string;
  states?: Record<
    string,
    { state: string; attributes?: Record<string, unknown> }
  >;
}
export type Localizer = (
  key: string,
  variables?: Record<string, string | number>,
) => string;
export type TopLevelView = "home" | "add" | "search" | "advanced";
export interface NavigationState {
  view: TopLevelView;
  areaId: string | null;
  assetId: string | null;
}
