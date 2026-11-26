
import {collectFolder,publishRequest,sha256} from '/home/user/tab/publish-cli.mjs';
const [dir,slug,title]=process.argv.slice(2);
const {files}=collectFolder(dir);
const manifest=files.map(f=>({path:f.path,sha256:sha256(f.bytes)}));
const enc=files.map(f=>({path:f.path,content_base64:f.bytes.toString('base64')}));
const body={slug,title,files:enc};
console.error('request bytes ~',JSON.stringify(body).length);
const out=await publishRequest('site.publish',body,{identity:{slug,manifest}});
console.log(JSON.stringify(out.result));
