import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '家具ピタ | 図面で試す、理想の暮らし', description: '住宅図面に家具を配置できる、ブラウザ保存のプランナー', applicationName:'家具ピタ', appleWebApp:{capable:true,title:'家具ピタ',statusBarStyle:'default'},icons:{apple:[{url:'/apple-icon.png',sizes:'180x180',type:'image/png'},{url:'/icons/apple-touch-icon-167.png',sizes:'167x167',type:'image/png'},{url:'/icons/apple-touch-icon-152.png',sizes:'152x152',type:'image/png'}]} };
export const viewport:Viewport={themeColor:'#28715b'};
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body>{children}</body></html>; }
