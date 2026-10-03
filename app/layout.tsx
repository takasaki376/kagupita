import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '家具ピタ | 図面で試す、理想の暮らし', description: '住宅図面に家具を配置できる、ブラウザ保存のプランナー' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body>{children}</body></html>; }
