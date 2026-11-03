# 家具ピタのアイコン

内蔵の画像生成ツールで新規生成したマスター画像を使用しています。

生成プロンプトの要旨：深緑の背景に、太い白い間取りの輪郭と、その中に収まるアイボリーのソファ。文字・細かな装飾を省いた、小さくても識別しやすいホーム画面用アイコン。背景は不透明、外側の角丸はOSに任せる。

## 使用したプロンプト

Use case: logo-brand. Asset type: production iPad home screen app icon and tiny browser favicon for a Japanese furniture floorplan placement app, Kagupita. Create ONE square 1024x1024 icon artwork, not a mockup or presentation. Opaque solid deep forest green background #28715b extending to all four edges, NO pre-rounded outer corners (OS applies mask). Center a bold simple warm white top-down room outline with an opening at bottom, and a single clearly recognizable warm ivory top-down sofa fitting neatly inside the room, the sofa built from large clean rounded rectangular cushions and two armrests. Minimal flat vector-like geometry, strong contrast, thick consistent strokes, generous 15% safe padding, instantly recognizable even at 32 pixels. No text, no letters, no gradients, no shadows, no texture, no dimension arrows, no tiny decorative details. The visual should communicate furniture fitting into a floorplan. Symmetric, friendly, polished and understated.

マスター：`kagupita-master.png`

`node scripts/generate-icons.mjs` で同じ画像からファビコン（16/32/48px）、PNGアイコン（32px）、Apple touch icon（152/167/180px）、Webアプリ用（192/512px）を再生成します。PNGの縮小と形式変換にsharpを使用します。
