export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Kotoba",
  description: "당신만의 일본어 단어장을 만들어보세요.",
  navItems: [
    {
      label: "홈",
      href: "/",
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
      label: "단어장",
      href: "/wordbook",
    },
  ],
};
