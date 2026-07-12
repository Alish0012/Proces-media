export type Influencer = {
  name: string;
  handle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok';
  followers?: string;
  photoUrl?: string; // /public altına gerçek fotoğrafı koyup buraya yolunu yazabilirsin
  profileUrl: string;
};

// TODO: Gerçek influencer'larla değiştirin. photoUrl verilmezse baş harfli renkli avatar gösterilir.
export const influencers: Influencer[] = [
  {
    name: 'Deniz Aksoy',
    handle: '@denizedits',
    platform: 'Instagram',
    followers: '128K',
    profileUrl: 'https://instagram.com',
  },
  {
    name: 'Mert Kaya',
    handle: '@mertkurgu',
    platform: 'YouTube',
    followers: '84K',
    profileUrl: 'https://youtube.com',
  },
  {
    name: 'Elif Yıldız',
    handle: '@elifcreates',
    platform: 'TikTok',
    followers: '212K',
    profileUrl: 'https://tiktok.com',
  },
  {
    name: 'Can Demir',
    handle: '@candemirfilms',
    platform: 'Instagram',
    followers: '65K',
    profileUrl: 'https://instagram.com',
  },
];
