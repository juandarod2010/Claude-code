// Tipos del dominio. No contienen ningún hecho jurídico: solo estructura.

/** Países de destino cubiertos por el MVP. */
export const COUNTRIES = ['DE', 'FR', 'ES', 'IT', 'NL', 'PL'] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  DE: 'Alemania',
  FR: 'Francia',
  ES: 'España',
  IT: 'Italia',
  NL: 'Países Bajos',
  PL: 'Polonia',
};

/** Flujos de residuo cubiertos por el MVP. */
export const WASTE_STREAMS = ['envases', 'aparatos_electricos', 'pilas'] as const;
export type WasteStream = (typeof WASTE_STREAMS)[number];

export const WASTE_STREAM_LABELS: Record<WasteStream, string> = {
  envases: 'Envases y residuos de envases',
  aparatos_electricos: 'Aparatos eléctricos y electrónicos',
  pilas: 'Pilas, baterías y acumuladores',
};

/**
 * Categorías de producto que el vendedor declara en el diagnóstico.
 * `streams` indica qué flujos de residuo activa cada categoría.
 * Ojo: TODA categoría activa `envases` porque todo lo que se envía va envasado.
 * Esa es una regla de producto nuestra, no una cita normativa. Ver DECISIONS.md.
 */
export const PRODUCT_CATEGORIES = [
  'textil',
  'electronica_consumo',
  'pequeno_electrodomestico',
  'juguetes',
  'juguetes_con_pilas',
  'cosmetica',
  'hogar_menaje',
  'herramientas_electricas',
  'suplementos_alimentacion',
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  textil: 'Textil y moda',
  electronica_consumo: 'Electrónica de consumo',
  pequeno_electrodomestico: 'Pequeño electrodoméstico',
  juguetes: 'Juguetes sin componente eléctrico',
  juguetes_con_pilas: 'Juguetes con pilas o batería',
  cosmetica: 'Cosmética e higiene',
  hogar_menaje: 'Hogar y menaje',
  herramientas_electricas: 'Herramientas eléctricas',
  suplementos_alimentacion: 'Suplementos y alimentación',
};

/** Qué flujos de residuo activa cada categoría de producto. */
export const CATEGORY_STREAMS: Record<ProductCategory, WasteStream[]> = {
  textil: ['envases'],
  electronica_consumo: ['envases', 'aparatos_electricos', 'pilas'],
  pequeno_electrodomestico: ['envases', 'aparatos_electricos'],
  juguetes: ['envases'],
  juguetes_con_pilas: ['envases', 'aparatos_electricos', 'pilas'],
  cosmetica: ['envases'],
  hogar_menaje: ['envases'],
  herramientas_electricas: ['envases', 'aparatos_electricos', 'pilas'],
  suplementos_alimentacion: ['envases'],
};

/** Canales de venta. Solo se usan para contexto comercial y para el informe. */
export const SALES_CHANNELS = ['amazon_eu', 'shopify', 'tiktok_shop', 'ebay', 'web_propia'] as const;
export type SalesChannel = (typeof SALES_CHANNELS)[number];

export const SALES_CHANNEL_LABELS: Record<SalesChannel, string> = {
  amazon_eu: 'Amazon EU',
  shopify: 'Shopify',
  tiktok_shop: 'TikTok Shop',
  ebay: 'eBay',
  web_propia: 'Web propia',
};

/** Materiales de envase declarados. */
export const PACKAGING_MATERIALS = ['papel_carton', 'plastico', 'vidrio', 'metal', 'madera', 'compuesto'] as const;
export type PackagingMaterial = (typeof PACKAGING_MATERIALS)[number];

export const PACKAGING_MATERIAL_LABELS: Record<PackagingMaterial, string> = {
  papel_carton: 'Papel y cartón',
  plastico: 'Plástico',
  vidrio: 'Vidrio',
  metal: 'Metal',
  madera: 'Madera',
  compuesto: 'Envase compuesto (varios materiales unidos)',
};

/** Tramos de volumen mensual aproximado, en unidades enviadas a la UE. */
export const VOLUME_BANDS = ['0-100', '101-1000', '1001-10000', '10000+'] as const;
export type VolumeBand = (typeof VOLUME_BANDS)[number];

export const VOLUME_BAND_LABELS: Record<VolumeBand, string> = {
  '0-100': 'Menos de 100 unidades al mes',
  '101-1000': 'Entre 100 y 1.000 unidades al mes',
  '1001-10000': 'Entre 1.000 y 10.000 unidades al mes',
  '10000+': 'Más de 10.000 unidades al mes',
};

/** Respuestas completas del formulario de diagnóstico. */
export interface DiagnosticAnswers {
  countries: CountryCode[];
  channels: SalesChannel[];
  categories: ProductCategory[];
  packagingMaterials: PackagingMaterial[];
  /** ¿Tiene el vendedor establecimiento (sede o filial) en la Unión Europea? */
  establishedInEU: boolean;
  volume: VolumeBand;
  email: string;
  /** Nombre comercial. Opcional: no se pregunta en pantalla propia. */
  companyName?: string;
}

export type RiskLevel = 'critico' | 'alto' | 'medio';

export const RISK_LABELS: Record<RiskLevel, string> = {
  critico: 'Crítico',
  alto: 'Alto',
  medio: 'Medio',
};
