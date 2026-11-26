
import requests, json, time, re, sys
from bs4 import BeautifulSoup
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) Chrome/124"}
ROOT="1KA2EkueVEh3Yfd-zkbmJN1vzokeydnx1"
n=0
def lst(fid):
    global n
    for att in range(3):
        try:
            time.sleep(1.0); n+=1
            r=requests.get("https://drive.google.com/embeddedfolderview?id="+fid,headers=UA,timeout=40)
            if r.status_code==200: break
        except Exception as e: print("err",fid,e,flush=True)
        time.sleep(3)
    s=BeautifulSoup(r.text,'lxml')
    out=[]
    for e in s.select('div.flip-entry'):
        t=e.select_one('.flip-entry-title'); a=e.select_one('a[href]')
        ic=e.select_one('.flip-entry-list-icon [aria-label]') or e.select_one('[aria-label]')
        lm=e.select_one('.flip-entry-last-modified')
        out.append(dict(title=t.get_text(strip=True) if t else '', href=a['href'] if a else '', icon=ic['aria-label'] if ic else '', icls=' '.join(ic.get('class',[])) if ic else '', modified=lm.get_text(strip=True) if lm else '', eid=e.get('id','')[6:]))
    return out
def walk(fid, path, depth):
    items=lst(fid); res=[]
    print(depth, '/'.join(path), len(items), flush=True)
    for it in items:
        h=it['href']
        if '/folders/' in h and depth<5:
            it['type']='folder'; it['id']=h.split('/folders/')[1].split('?')[0]
            it['children']=walk(it['id'], path+[it['title']], depth+1)
        else:
            m=re.search(r'/d/([\w-]+)',h); it['id']=m.group(1) if m else it['eid']
        res.append(it)
    return res
SUBS=[("☂️ادعيه☂️","1eNERPHXrWGLvv48HjXdwbGQdGQzprRti"),("☂️جداول تحفيزية لحفظ القران☂️","1CvIhtwLd4sI1THy7mvNFBGKm1OfsDpNJ"),("☂️مصحف القيام☂️","1hvKHwYxTYoaJdHdnYkaqZ3X-ZDccdzqu"),("☂️رمضان☂️","1-klTDyb6TQcOxWWZhzXEKTAHolCkDaOH"),("☂️التقويم الهجري☂️","1sVpeTIA1oY-sxn98CmUWHMHRnB0xGygf"),("☂️ألعاب أنشطة ومسابقات☂️","14t8pL9dr4wMbYWYNsOKciWYeFZvZXSWP"),("☂️مسابقات ذهنية☂️","1jrXmYNPgM1IKnlNriQSRhd03MizAzH1q"),("☂️كتب قصص☂️","1VgTdM2ay0e7BbWIXvwbrC0KUG3rw6R7-"),("☂️كتب تربوية☂️","1worG9CdVlIdpnHtBYlm1HXN5pkouhTeT"),("☂️كتب☂️","1S7_u_ujwnsAvhD88qSmPkbpVjN_ouOO5")]
ROOT="10dtBGnehzysIHaPiA6KoUPzaZ4dNx1r0"
top=lst(ROOT)
tree=[]
for t,i in SUBS:
    tree.append(dict(title=t,id=i,type='folder',href='https://drive.google.com/drive/folders/'+i,children=walk(i,[t],2)))
json.dump(dict(root=ROOT,crawled_at=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),requests=n,tree=tree,top=top),open('/home/user/tab/work/v520/raw-tree2.json','w'),ensure_ascii=False,indent=1)
print("DONE",n,flush=True)
