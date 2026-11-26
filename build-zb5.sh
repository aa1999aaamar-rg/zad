#!/bin/sh
# v4.9: rebuild the lazy wave-B module. Run from the source root.
cat src/zb5-engine.js src/zb5-ui1.js src/zb5-ui2.js src/zb5-ui3.js src/zb5-ui4.js src/zb5-ui5.js > src/zb5-src.js && npx -y terser src/zb5-src.js -c -m -o content/site/zb5.js
