#!/bin/sh
# zb7 = «الأذكار المطوّرة» (v5.1). Run from the source root.
node -e 'const fs=require("fs");const d=fs.readFileSync("src/zb7-data.json","utf8");fs.writeFileSync("src/zb7-src.js",fs.readFileSync("src/zb7-src.tpl.js","utf8").replace("__DATA__",d.trim()))' && npx -y terser src/zb7-src.js -c -m -o content/site/zb7.js
