export type Brand = {
  name: string;
  logoUrl?: string; // /public altına gerçek logo görselini koyup buraya yolunu yazabilirsin, örn. "/brands/marka.png"
};

// TODO: Gerçek referans markalarınızla değiştirin. logoUrl verilmezse marka adı stilize şekilde gösterilir.
export const brands: Brand[] = [
  { name: 'Nova Teknoloji' },
  { name: 'Atlas Yazılım' },
  { name: 'Kentsel Medya' },
  { name: 'Vizyon Dijital' },
  { name: 'Parlak Ajans' },
  { name: 'Mavi Ok Reklam' },
  { name: 'Sistem360' },
  { name: 'Orion Studio' },
];
