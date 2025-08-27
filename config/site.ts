export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Kotoba",
  description: "당신만의 특별한 단어장",
  navItems: [
    {
      label: "홈",
      href: "/",
    },
    {
      label: "뉴스 요약",
      href: "/news",
    },
    {
      label: "단어장",
      href: "/wordbook",
    },
  ],
  navMenuItems: [
    {
      label: "홈",
      href: "/",
    },
    {
      label: "뉴스 요약",
      href: "/news",
    },
    {
      label: "단어장",
      href: "/wordbook",
    },
  ],
};
