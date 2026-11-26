#!/bin/sh
# Bundle the server. Run from the source root after `npm i esbuild` (adhan-js is vendored as srv/adhan-umd.js = site/adhan.js).
# srv/legacy.js = the previous site/_worker.js with `export default {` renamed to `export const LEGACY = {` (assetlinks, /install, /book/raheeq.pdf).
cd srv && sed -e 's/^export async function /async function /' -e 's/^export function /function /' worker-src.js > .worker-prod.js && \
npx esbuild ./.worker-prod.js --bundle --format=esm --minify --loader:.html=text --charset=utf8 --outfile=../site/_worker.js
