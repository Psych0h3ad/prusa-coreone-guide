# CoreXY maintenance motion

既存のベルト調整手順に、NextruderのX移動、ガントリーの前方移動、実調整ねじと連動する全周ベルト、全長スリーブ・PTFEの動作を加えるソースです。準備・写真・警告・4言語の本文は既存手順を使います。

ベルトは実ホルダーの中央穴からリブを回して外側穴に戻します。長い側をホルダー裏側へ通し、実際の外側スロット出口から4歯分の材料を残します。左右の調整ねじはそれぞれ実キャリア・ナット・軸・アイドラー3部品を動かします。

The two open 2GT routes retain1524mm of reference material,762pitches,6mm width,1.38mm maximum section and complete end faces. Their existing authored tooth section is retained. The taut posed path may extend during tightening; loosening redistributes complete material into a smooth rear-bay bow. This geometric teaching model does not predict force, frequency or a belt manufacturer's exact tooth shape.

The existing39Y references,20base X references and seven local leads remain native parts. The710mm declared PTFE, original mounted polyline and532.3487419775057mm/r4.2sleeve retain complete skins, end faces and moving support registrations. The runtime restores native actors and source skins on leaving the procedure and disposes owned resources through the normal Viewer lifetime.

Rebuild into an explicit destination with `node source/corexy-maintenance-owner/build.mjs --out DESTINATION`. The projector applies only the three exact host fields in `fields.json` and copies the eight runtime modules. Import-map/cache integration belongs to the destination application; no replacement HTML or manifest is supplied. See SOURCES.json and NOTICES.md for sources and attribution.
