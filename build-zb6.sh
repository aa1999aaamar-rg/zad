#!/bin/sh
# zb6 = «ديوانية زاد» + «دروس زاد» (v5.0). Run from the source root.
cat src/zb6-p1.js src/zb6-p2.js src/zb6-p3.js > src/zb6-src.js && npx terser src/zb6-src.js -c -m -o content/site/zb6.js
