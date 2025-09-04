import { type PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return <main className='container flex-grow px-6 mx-auto max-w-7xl md:pt-16'>{children}</main>;
}
