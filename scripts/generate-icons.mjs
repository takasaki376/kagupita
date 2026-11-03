import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const source='public/icons/kagupita-master.png';
for(const [file,size] of [['app/icon.png',32],['app/apple-icon.png',180],['public/icons/apple-touch-icon-167.png',167],['public/icons/apple-touch-icon-152.png',152],['public/icons/icon-192.png',192],['public/icons/icon-512.png',512]]){
 await sharp(source).resize(size,size).png().toFile(file);
}
const sizes=[16,32,48],images=await Promise.all(sizes.map(size=>sharp(source).resize(size,size).ensureAlpha().png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;images.forEach((buffer,i)=>{const entry=6+i*16;header[entry]=sizes[i];header[entry+1]=sizes[i];header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(buffer.length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=buffer.length;});
await writeFile('app/favicon.ico',Buffer.concat([header,...images]));
console.log('Generated favicon, Apple touch icons and PWA icons.');
