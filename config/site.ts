export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'Kotoba',
  description: '당신만의 특별한 단어장',
  url: 'https://koto-ba.site',
  ogImage: '/images/og-image.png',
  keywords: ['일본어 단어', '일본어', '일단어', '단어', '공부', 'NHK', 'AI', '뉴스', '뉴스 요약'],
  navItems: [
    {
      label: '홈',
      href: '/',
    },
    {
      label: '뉴스 요약',
      href: '/news',
    },
    {
      label: '단어장',
      href: '/wordbook',
    },
  ],
  navMenuItems: [
    {
      label: '홈',
      href: '/',
    },
    {
      label: '뉴스 요약',
      href: '/news',
    },
    {
      label: '단어장',
      href: '/wordbook',
    },
  ],
};
