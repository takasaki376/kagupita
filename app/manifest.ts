import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest{return{
 id:'/',name:'家具ピタ',short_name:'家具ピタ',description:'住宅図面上で家具の配置を実寸で試せるプランナー',lang:'ja',start_url:'/',scope:'/',display:'standalone',background_color:'#f9faf7',theme_color:'#28715b',
 icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}],
};}
