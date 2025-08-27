import { type PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <main className="overflow-hidden">{children}</main>;
}
