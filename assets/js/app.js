(function(){
  var root=document.documentElement;
  var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:v;}catch(e){return d;}},
          set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
  var RB=window.RB, SEVN=RB.sevName;
  var SEVC={crit:'var(--crit)',high:'var(--high)',med:'var(--med)',low:'var(--low)',info:'var(--info)'};

  /* ---------- theme ---------- */
  var tbtn=document.getElementById('themeBtn');
  function applyTheme(t){root.setAttribute('data-theme',t); tbtn.textContent=(t==='light')?'☀':'☾';}
  applyTheme(LS.get('rb-theme', window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
  tbtn.addEventListener('click',function(){var t=root.getAttribute('data-theme')==='light'?'dark':'light'; applyTheme(t); LS.set('rb-theme',t);});

  /* ---------- scope (bug bounty / pentest / all) ---------- */
  var scope=LS.get('rb-scope','all');
  function itemInScope(it){ if(scope==='all')return true; if(scope==='bb')return it.sc!=='pt'; return it.sc!=='bb'; }
  function modVisibleCount(m){ var n=0; m.items.forEach(function(it){if(itemInScope(it))n++;}); return n; }

  /* ---------- progress store ---------- */
  var store={}; try{store=JSON.parse(LS.get('rb-progress','{}'));}catch(e){store={};}
  function save(){LS.set('rb-progress',JSON.stringify(store));}

  var staticItems=Array.prototype.slice.call(document.querySelectorAll('#p-chatbot ul.ck li'));
  staticItems.forEach(function(li,i){li.dataset.k='s:'+i; if(store[li.dataset.k])li.classList.add('done');});
  var dataTotal=0; RB.mods.forEach(function(m){dataTotal+=m.items.length;});
  var grandTotal=staticItems.length+dataTotal;

  var gbar=document.getElementById('gbar'), glbl=document.getElementById('glbl');
  function doneCount(){var n=0;for(var k in store){if(store[k])n++;}return n;}
  function paintGlobal(){var n=doneCount(); gbar.style.width=(grandTotal?Math.round(n/grandTotal*100):0)+'%'; glbl.textContent=n+' / '+grandTotal+' done';}
  staticItems.forEach(function(li){
    li.addEventListener('click',function(){li.classList.toggle('done'); if(li.classList.contains('done'))store[li.dataset.k]=true; else delete store[li.dataset.k]; save(); paintGlobal(); updateCounts();});
  });

  function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function modsOf(cat){return RB.mods.filter(function(m){return m.cat===cat;});}
  function modById(id){return RB.mods.filter(function(m){return m.id===id;})[0];}
  function catById(id){return RB.cats.filter(function(c){return c.id===id;})[0];}
  function modDone(id){var n=0,pfx='d:'+id+':';for(var k in store){if(store[k]&&k.indexOf(pfx)===0)n++;}return n;}

  /* ---------- build sidebar ---------- */
  var modnav=document.getElementById('modnav');
  function buildSidebar(){
    var html='<div class="grp">Start</div>'+
      '<button class="navbtn" data-v="home"><span class="dot"></span>Home<span class="ct"></span></button>'+
      '<button class="navbtn" data-v="target"><span class="dot"></span>Target planner<span class="ct">IP·dom</span></button>'+
      '<div class="grp">Categories</div>';
    RB.cats.forEach(function(c){
      var ms=modsOf(c.id); if(!ms.length&&c.id!=='ai')return;
      var extra=(c.id==='ai')?1:0; // chatbot runbook lives under AI
      html+='<div class="catgrp" data-cat="'+c.id+'" style="--cat:'+c.hue+'">'+
        '<button class="cathead" data-v="cat:'+c.id+'"><span class="ci">'+c.icon+'</span>'+
          '<span class="cname">'+c.label+'</span><span class="cnum">'+(ms.length+extra)+'</span>'+
          '<span class="carr">▸</span></button>'+
        '<div class="subwrap"><div class="subnav">';
      if(c.id==='ai'){
        html+='<button data-v="chatbot"><span class="sdot"></span>Chatbot / LLM runbook<span class="ct" id="ct-chatbot">RB</span></button>';
      }
      ms.forEach(function(m){
        html+='<button data-v="mod:'+m.id+'"><span class="sdot"></span>'+esc(m.title)+
          '<span class="ct" id="ct-'+m.id+'">'+modVisibleCount(m)+'</span></button>';
      });
      html+='</div></div></div>';
    });
    html+='<div class="grp">Reference</div>'+
      '<button class="navbtn" data-v="about"><span class="dot"></span>About &amp; deploy</button>';
    modnav.innerHTML=html;
  }

  function updateCounts(){
    // module counts (scope-aware, show done/total when progress exists)
    RB.mods.forEach(function(m){
      var el=document.getElementById('ct-'+m.id); if(!el)return;
      var d=modDone(m.id), vis=modVisibleCount(m);
      el.textContent=d?d+'/'+vis:vis;
    });
    var cb=document.getElementById('ct-chatbot');
    if(cb){var cd=0;for(var k in store){if(store[k]&&k.indexOf('s:')===0)cd++;} cb.textContent=cd?cd+'/'+staticItems.length:'RB';}
  }

  /* ---------- top navbar ---------- */
  var crumb=document.getElementById('crumb');
  function setCrumb(parts, hue){
    document.getElementById('topnav').style.setProperty('--cat',hue||'var(--accent)');
    crumb.innerHTML='<span class="cdot"></span>'+parts.map(function(p,i){
      return (i?'<span class="sep">/</span>':'')+(i===parts.length-1?'<b>'+esc(p)+'</b>':'<span>'+esc(p)+'</span>');
    }).join(' ');
  }
  // scope buttons
  document.querySelectorAll('.scope button[data-sc]').forEach(function(b){
    b.classList.toggle('on',b.dataset.sc===scope);
    b.addEventListener('click',function(){
      scope=b.dataset.sc; LS.set('rb-scope',scope);
      document.querySelectorAll('.scope button[data-sc]').forEach(function(x){x.classList.toggle('on',x.dataset.sc===scope);});
      // rebuild counts + re-filter any built modules + refresh current landing
      updateCounts();
      for(var id in built){ if(built[id]._applyFilter) built[id]._applyFilter(); }
      if(curView.indexOf('cat:')===0) renderCat(curView.slice(4));
    });
  });

  /* ---------- stack badge helper ---------- */
  function stackBadges(stacks,cls){
    if(!stacks||!stacks.length)return '';
    return stacks.map(function(s){
      var nm=RB.stackName[s]||s, hue=RB.stackHue[s];
      if(cls==='mod') return '<span class="stackbadge"'+(hue?' style="--stk:'+hue+'"':'')+'>'+esc(nm)+'</span>';
      return '<span class="stkchip">'+esc(nm)+'</span>';
    }).join('');
  }

  /* ---------- render a module ---------- */
  var built={};
  function group(items){var g={},order=[];items.forEach(function(it,i){if(!g[it.c]){g[it.c]=[];order.push(it.c);}g[it.c].push({it:it,i:i});});return {g:g,order:order};}

  function buildModule(m){
    var cat=catById(m.cat);
    var wrap=document.createElement('div'); wrap.className='mod'; wrap.dataset.mod=m.id; wrap.style.setProperty('--cat',cat.hue);
    var sevCount={crit:0,high:0,med:0,low:0,info:0}; m.items.forEach(function(it){sevCount[it.s]++;});

    var head=document.createElement('div'); head.className='mhead';
    head.innerHTML='<p class="mcat"><span class="cdot"></span>'+esc(cat.label)+'</p>'+
      '<h2>'+esc(m.title)+'</h2>'+
      '<p class="sub">'+m.items.length+' checks · '+esc(m.tag)+'. Search, filter by severity &amp; scope, tick as you go. Click any item for detection, steps, payloads and impact.</p>'+
      (m.stacks&&m.stacks.length?'<div class="stackrow">'+stackBadges(m.stacks,'mod')+'</div>':'');
    wrap.appendChild(head);

    var ctr=document.createElement('div'); ctr.className='controls';
    // per-item stacks present in this module?
    var itemStacks={}; m.items.forEach(function(it){(it.stacks||[]).forEach(function(s){itemStacks[s]=1;});});
    var stackKeys=Object.keys(itemStacks);
    ctr.innerHTML='<input class="search" placeholder="Search '+m.items.length+' checks — name, category, payload…" aria-label="Search">'+
      '<div class="filters">'+
        ['crit','high','med','low','info'].filter(function(s){return sevCount[s];}).map(function(s){return '<button class="chip" data-s="'+s+'">'+SEVN[s]+' '+sevCount[s]+'</button>';}).join('')+
        (stackKeys.length?'<span style="width:1px;height:20px;background:var(--border-soft);margin:0 2px"></span>'+
          stackKeys.map(function(s){return '<button class="chip stk" data-stk="'+s+'">'+(RB.stackName[s]||s)+'</button>';}).join(''):'')+
        '<span class="spacer"></span>'+
        '<button class="chip act" data-act="expand">expand all</button>'+
        '<button class="chip act" data-act="collapse">collapse</button>'+
      '</div>';
    wrap.appendChild(ctr);
    var countline=document.createElement('div'); countline.className='countline'; wrap.appendChild(countline);
    var list=document.createElement('div'); list.className='list'; wrap.appendChild(list);

    var gr=group(m.items);
    gr.order.forEach(function(catn){
      var cel=document.createElement('div'); cel.className='cat';
      var rows=gr.g[catn];
      var sc={crit:0,high:0,med:0,low:0,info:0}; rows.forEach(function(r){sc[r.it.s]++;});
      var mini=['crit','high','med','low','info'].filter(function(s){return sc[s];}).map(function(s){return '<i style="background:'+SEVC[s]+'" title="'+sc[s]+' '+SEVN[s]+'"></i>';}).join('');
      var ch=document.createElement('div'); ch.className='ch';
      ch.innerHTML='<span class="cv">▸</span><span class="nm">'+esc(catn)+'</span><span class="mini">'+mini+'</span><span class="n">'+rows.length+'</span>';
      ch.addEventListener('click',function(){cel.classList.toggle('open');});
      cel.appendChild(ch);
      var body=document.createElement('div'); body.className='body';
      rows.forEach(function(r){
        var it=r.it, key='d:'+m.id+':'+r.i;
        var row=document.createElement('div'); row.className='row'; if(store[key])row.classList.add('done');
        row.dataset.k=key;
        row.dataset.txt=(it.n+' '+it.c+' '+it.d+' '+(it.p||'')+' '+(it.stacks||[]).join(' ')).toLowerCase();
        row.dataset.s=it.s; row.dataset.sc=it.sc||'both'; row.dataset.stk=(it.stacks||[]).join(',');
        var rh=document.createElement('div'); rh.className='rh';
        var badges='';
        if(it.sc==='pt')badges+='<span class="scopebadge pt">pentest</span>';
        if(it.sc==='bb')badges+='<span class="scopebadge bb">bug bounty</span>';
        badges+=stackBadges(it.stacks,'row');
        rh.innerHTML='<span class="rbox"></span><span class="rname"><span class="nt">'+esc(it.n)+'</span>'+badges+'</span><span class="sev '+it.s+'">'+SEVN[it.s]+'</span><span class="cv2">▸</span>';
        rh.querySelector('.rbox').addEventListener('click',function(e){e.stopPropagation(); row.classList.toggle('done'); if(row.classList.contains('done'))store[key]=true; else delete store[key]; save(); paintGlobal(); updateCounts();});
        rh.addEventListener('click',function(){row.classList.toggle('exp'); if(!row.dataset.built){row.appendChild(detail(it)); row.dataset.built='1';}});
        row.appendChild(rh); body.appendChild(row);
      });
      cel.appendChild(body); list.appendChild(cel);
    });

    function detail(it){
      var d=document.createElement('div'); d.className='detail';
      function f(label,val,cls){if(!val)return ''; return '<div class="field '+(cls||'')+'"><div class="fl">'+label+'</div><p>'+esc(val)+'</p></div>';}
      var html='';
      html+=f('what it is',it.d,'');
      html+=f('detect / params',it.det,'muted');
      html+=f('steps',it.st,'');
      if(it.p){html+='<div class="field pay"><div class="fl">payloads / commands</div><pre>'+esc(it.p)+'</pre><button class="copy">copy</button></div>';}
      html+=f('impact',it.im,'muted');
      html+=f('tools',it.t,'muted');
      var xm='';
      if(it.x){for(var kk in it.x){xm+='<span class="x"><b>'+esc(kk)+':</b> '+esc(it.x[kk])+'</span>';}}
      if(xm)html+='<div class="xmeta">'+xm+'</div>';
      d.innerHTML=html;
      var cb=d.querySelector('.pay .copy');
      if(cb)cb.addEventListener('click',function(){navigator.clipboard.writeText(it.p).then(function(){cb.textContent='copied';cb.classList.add('ok');setTimeout(function(){cb.textContent='copy';cb.classList.remove('ok');},1300);});});
      return d;
    }

    var search=ctr.querySelector('.search'), activeSev={}, activeStk={};
    function applyFilter(){
      var q=search.value.trim().toLowerCase();
      var sevs=Object.keys(activeSev).filter(function(s){return activeSev[s];});
      var stks=Object.keys(activeStk).filter(function(s){return activeStk[s];});
      var shown=0;
      list.querySelectorAll('.cat').forEach(function(cel){
        var vis=0;
        cel.querySelectorAll('.row').forEach(function(row){
          var scOk=(scope==='all')||(scope==='bb'&&row.dataset.sc!=='pt')||(scope==='pt'&&row.dataset.sc!=='bb');
          var stkOk=!stks.length|| stks.some(function(s){return row.dataset.stk.split(',').indexOf(s)>=0;});
          var ok=scOk&&stkOk&&(!q||row.dataset.txt.indexOf(q)>=0)&&(!sevs.length||sevs.indexOf(row.dataset.s)>=0);
          row.style.display=ok?'':'none'; if(ok){vis++;shown++;}
        });
        cel.style.display=vis?'':'none';
        if((q||stks.length)&&vis)cel.classList.add('open');
      });
      var filtered=(q||sevs.length||stks.length||scope!=='all');
      countline.innerHTML='<b>'+shown+'</b> of '+m.items.length+' checks'+(filtered?' matching':'')+(scope!=='all'?' · <b>'+(scope==='bb'?'Bug Bounty':'Pentest')+'</b> scope':'');
      var em=list.querySelector('.empty'); if(!shown){if(!em){em=document.createElement('div');em.className='empty';em.textContent='no matches for this filter';list.appendChild(em);}}else if(em)em.remove();
    }
    wrap._applyFilter=applyFilter;
    search.addEventListener('input',applyFilter);
    ctr.querySelectorAll('.chip[data-s]').forEach(function(c){c.addEventListener('click',function(){var s=c.dataset.s; activeSev[s]=!activeSev[s]; c.classList.toggle('on',activeSev[s]); applyFilter();});});
    ctr.querySelectorAll('.chip[data-stk]').forEach(function(c){c.addEventListener('click',function(){var s=c.dataset.stk; activeStk[s]=!activeStk[s]; c.classList.toggle('on',activeStk[s]); applyFilter();});});
    ctr.querySelector('[data-act="expand"]').addEventListener('click',function(){list.querySelectorAll('.cat').forEach(function(c){c.classList.add('open');});});
    ctr.querySelector('[data-act="collapse"]').addEventListener('click',function(){list.querySelectorAll('.cat').forEach(function(c){c.classList.remove('open');});});
    applyFilter();
    return wrap;
  }

  /* ---------- category landing ---------- */
  function renderCat(catid){
    var c=catById(catid), ms=modsOf(catid);
    var tot=0; ms.forEach(function(m){tot+=modVisibleCount(m);});
    var html='<div class="catland" style="--cat:'+c.hue+'">'+
      '<p class="mcat"><span class="ci" style="display:inline-grid;place-items:center;width:20px;height:20px">'+c.icon+'</span> '+esc(c.label)+'</p>'+
      '<h2>'+esc(c.label)+' testing</h2>'+
      '<p class="sub">'+ms.length+' module'+(ms.length>1?'s':'')+' · '+tot+' checks in the current scope. Pick a module to start, or switch the scope filter in the top bar.</p>'+
      '<div class="catcards">';
    if(catid==='ai'){
      var cd=0;for(var k in store){if(store[k]&&k.indexOf('s:')===0)cd++;}
      html+='<button class="ccard" data-v="chatbot" style="--cat:'+c.hue+'">'+
        '<span class="ctitle">Chatbot / LLM runbook</span>'+
        '<span class="ctag">hand-written methodology · recon → report</span>'+
        '<span class="cbars"><i style="background:var(--crit);flex:1"></i><i style="background:var(--high);flex:2"></i></span>'+
        '<span class="cmeta"><span class="pill">'+document.querySelectorAll("#p-chatbot ul.ck li").length+' checks</span>'+(cd?'<span class="pill">'+cd+' done</span>':'')+'<span>IDOR · SSRF · output</span></span>'+
        '</button>';
    }
    ms.forEach(function(m){
      var sevCount={crit:0,high:0,med:0,low:0,info:0}; m.items.forEach(function(it){if(itemInScope(it))sevCount[it.s]++;});
      var vis=modVisibleCount(m), done=modDone(m.id);
      var bars=['crit','high','med','low','info'].filter(function(s){return sevCount[s];}).map(function(s){
        return '<i style="background:'+SEVC[s]+';flex:'+sevCount[s]+'" title="'+sevCount[s]+' '+SEVN[s]+'"></i>';}).join('');
      html+='<button class="ccard" data-v="mod:'+m.id+'" style="--cat:'+c.hue+'">'+
        '<span class="ctitle">'+esc(m.title)+'</span>'+
        '<span class="ctag">'+esc(m.tag)+'</span>'+
        '<span class="cbars">'+bars+'</span>'+
        '<span class="cmeta"><span class="pill">'+vis+' checks</span>'+(done?'<span class="pill">'+done+' done</span>':'')+
          (m.stacks&&m.stacks.length?'<span>'+m.stacks.slice(0,3).map(function(s){return RB.stackName[s]||s;}).join(' · ')+'</span>':'')+'</span>'+
        '</button>';
    });
    html+='</div></div>';
    pData.innerHTML=html;
    setCrumb([c.label],c.hue);
  }

  /* ---------- home / overview ---------- */
  function renderHome(){
    var totMods=RB.mods.length, totItems=RB.mods.reduce(function(a,m){return a+m.items.length;},0)+staticItems.length;
    var crit=RB.mods.reduce(function(a,m){return a+m.items.filter(function(i){return i.s==='crit';}).length;},0);
    var html='<div class="home-hero">'+
      '<p class="eyebrow">// bug bounty + pentest · authorized testing only</p>'+
      '<h1>One runbook for the<br>whole engagement.</h1>'+
      '<p class="lede">A searchable, scope-filterable field manual spanning AI/LLM, web &amp; modern Node/React/SSR, server-side, API, cloud, mobile, thick-client and OT — plus a target planner that turns a domain or IP into a step-by-step plan.</p>'+
      '<div class="homestats">'+
        '<div class="homestat"><b>'+totItems+'</b><span>checks</span></div>'+
        '<div class="homestat"><b>'+(totMods+1)+'</b><span>modules</span></div>'+
        '<div class="homestat"><b>'+RB.cats.length+'</b><span>categories</span></div>'+
        '<div class="homestat"><b>'+crit+'</b><span>critical-rated</span></div>'+
      '</div>'+
      '<div class="home-cta">'+
        '<div class="ct-t"><b>Have a target already?</b><p>Drop a domain or IP into the planner and get a tailored, copy-ready methodology.</p></div>'+
        '<button class="genbtn" data-v="target">Open target planner →</button>'+
      '</div>'+
    '</div>'+
    '<p class="home-sec-h">Categories</p>'+
    '<div class="catcards">';
    RB.cats.forEach(function(c){
      var ms=modsOf(c.id); var extra=(c.id==='ai')?1:0;
      var items=ms.reduce(function(a,m){return a+modVisibleCount(m);},0);
      var sev={crit:0,high:0,med:0,low:0,info:0};
      ms.forEach(function(m){m.items.forEach(function(it){if(itemInScope(it))sev[it.s]++;});});
      var bars=['crit','high','med','low','info'].filter(function(s){return sev[s];}).map(function(s){
        return '<i style="background:'+SEVC[s]+';flex:'+sev[s]+'"></i>';}).join('');
      html+='<button class="ccard" data-v="cat:'+c.id+'" style="--cat:'+c.hue+'">'+
        '<span class="ctitle" style="display:flex;align-items:center;gap:9px"><span class="ci" style="display:inline-grid;place-items:center;width:22px;height:22px;color:'+c.hue+'">'+c.icon+'</span>'+esc(c.label)+'</span>'+
        '<span class="ctag">'+(ms.length+extra)+' module'+((ms.length+extra)>1?'s':'')+'</span>'+
        '<span class="cbars">'+bars+'</span>'+
        '<span class="cmeta"><span class="pill">'+items+' checks</span></span>'+
        '</button>';
    });
    html+='</div>';
    document.getElementById('p-home').innerHTML=html;
  }

  /* ---------- target planner ---------- */
  function cp(label,cmd){ // copyable command block
    return '<div class="planblock"><div class="bh"><span>'+esc(label)+'</span><button class="copy" data-cmd="'+encodeURIComponent(cmd)+'">copy</button></div><pre>'+cmd.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre></div>';
  }
  function parseTarget(raw){
    var t=raw.trim(); var type='domain', host=t, url='';
    if(/^https?:\/\//i.test(t)){ url=t; try{host=new URL(t).hostname;}catch(e){host=t.replace(/^https?:\/\//,'').split('/')[0];} }
    if(/^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(host)) type='ip';
    else if(/^[a-f0-9:]+$/i.test(host)&&host.indexOf(':')>=0) type='ip';
    return {raw:t,host:host,type:type,url:url||('https://'+host)};
  }
  function buildPlan(tg,opts){
    var h=tg.host, isIP=tg.type==='ip', web=opts.indexOf('web')>=0, api=opts.indexOf('api')>=0,
        net=opts.indexOf('net')>=0, cloud=opts.indexOf('cloud')>=0, mobile=opts.indexOf('mobile')>=0, ai=opts.indexOf('ai')>=0;
    var phases=[];
    phases.push({t:'Scope & rules of engagement',d:'Confirm the asset is in scope and what you may do before you touch it.',
      blocks:[], links:[['pentest','Pentest Essentials'],['dast','Web / API DAST']],
      note:'Verify ownership/authorization for <b>'+esc(h)+'</b>. Note allowed techniques (automated scanning, brute force, DoS), rate limits, and reporting channel. Keep evidence minimal and redact real PII.'});
    if(!isIP){
      phases.push({t:'Passive recon',d:'Learn the footprint without touching the target hard.',
        blocks:[ cp('whois / DNS','whois '+h+'\ndig +nocmd '+h+' any +multiline\ndig +short '+h+' A AAAA MX TXT NS'),
          cp('certificate transparency','curl -s "https://crt.sh/?q=%25.'+h+'&output=json" | jq -r ".[].name_value" | sort -u'),
          cp('ASN / netblocks','# find owning ASN then ranges\nwhois -h whois.cymru.com " -v $(dig +short '+h+' | head -1)"') ],
        links:[['pentest','Pentest Essentials']]});
      phases.push({t:'Subdomain enumeration',d:'Expand the attack surface; most bugs live on forgotten hosts.',
        blocks:[ cp('passive + active','subfinder -d '+h+' -all -silent | tee subs.txt\namass enum -passive -d '+h+' | anew subs.txt'),
          cp('resolve & probe live','cat subs.txt | dnsx -silent | httpx -silent -title -tech-detect -status-code -o live.txt'),
          cp('subdomain takeover','nuclei -l subs.txt -t http/takeovers/ -silent\nsubjack -w subs.txt -ssl -v') ],
        links:[['pentest','Pentest Essentials']]});
    }
    if(net){
      phases.push({t:'Port & service scan',d:'Map the listening services and versions.',
        blocks:[ cp('fast sweep','nmap -Pn -T4 --top-ports 1000 '+h+' -oA nmap_top'),
          cp('full + version + scripts','nmap -Pn -p- --min-rate 2000 '+h+' -oA nmap_all\nnmap -Pn -sCV -p <open-ports> '+h+' -oA nmap_sv'),
          cp('UDP top ports','sudo nmap -Pn -sU --top-ports 50 '+h+' -oA nmap_udp') ],
        links:isIP?[['pentest','Pentest Essentials'],['thickclient','Thick Client']]:[['pentest','Pentest Essentials']]});
    }
    if(web){
      phases.push({t:'Web discovery & fingerprint',d:'Identify the stack, then the hidden content.',
        blocks:[ cp('tech & headers',"httpx -u "+tg.url+" -title -tech-detect -server -status-code -location\nwhatweb "+tg.url),
          cp('content discovery','ffuf -u '+tg.url+'/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -mc all -fc 404 -o ffuf.json\nferoxbuster -u '+tg.url+' -d 2'),
          cp('crawl + JS secrets','katana -u '+tg.url+' -jc -o urls.txt\n# pull JS, hunt endpoints/keys\ncat urls.txt | grep "\\.js" | nuclei -t http/exposures/ -silent'),
          cp('nuclei baseline','nuclei -u '+tg.url+' -severity low,medium,high,critical -o nuclei.txt') ],
        links:[['dast','Web / API DAST'],['modernweb','Modern Web (Node/React/SSR)'],['serverside','Server-Side Attacks'],['pentest','Pentest Essentials']]});
      phases.push({t:'Web app testing',d:'Now go manual — the modules below are your checklist against '+esc(h)+'.',
        blocks:[ cp('proxy everything','# route the browser through Burp/Caido\n# map auth, roles, tenants; then work the checklists:') ],
        links:[['modernweb','Modern Web (Node/React/SSR)'],['serverside','Server-Side Attacks'],['dast','Web / API DAST'],['fileupload','File Upload'],['pentest','Pentest Essentials']]});
    }
    if(api){
      phases.push({t:'API testing',d:'REST / GraphQL / WS — authz and injection are where it pays.',
        blocks:[ cp('discover API','httpx -u '+tg.url+'/api -path /api,/v1,/v2,/graphql,/swagger.json,/openapi.json -mc 200,401,403\n# import any swagger/openapi into Burp'),
          cp('graphql','# introspection\ncurl -s '+tg.url+'/graphql -H "Content-Type: application/json" -d \'{"query":"{__schema{types{name}}}"}\'') ],
        links:[['api','API Security'],['serverside','Server-Side Attacks'],['pentest','Pentest Essentials']]});
    }
    if(cloud){
      phases.push({t:'Cloud footprint',d:'Find exposed buckets, metadata paths and the provider.',
        blocks:[ cp('provider & buckets','# cname/ip → provider; hunt storage\nnuclei -u '+tg.url+' -t http/misconfiguration/ -silent\n# S3: aws s3 ls s3://'+h.split('.')[0]+' --no-sign-request'),
          cp('SSRF → metadata (if an SSRF sink exists)','# AWS\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/') ],
        links:[['aws','AWS Cloud'],['azure','Azure Cloud'],['serverside','Server-Side Attacks']]});
    }
    if(mobile){
      phases.push({t:'Mobile app testing',d:'If there is an Android/iOS client for '+esc(h)+'.',
        blocks:[ cp('static first','# Android\napktool d app.apk -o out && jadx -d src app.apk\ngrep -rEi "http|api|secret|key" out/\n# iOS: class-dump / Ghidra on the decrypted binary') ],
        links:[['android','Android Mobile'],['ios','iOS Mobile']]});
    }
    if(ai){
      phases.push({t:'AI / LLM surface',d:'If the app exposes a chatbot, RAG, agent or MCP server.',
        blocks:[ cp('map the AI plumbing','# proxy the chat/stream API; classify plain-LLM vs RAG vs agent\n# test: direct + indirect prompt injection, tool/param injection, output rendering') ],
        links:[['chatbot','Chatbot / LLM runbook'],['aisec','AI App · RAG · MCP · Agents']]});
    }
    phases.push({t:'Report',d:'Lead with impact; map to the right standard.',blocks:[],
      links:[['pentest','Pentest Essentials']],
      note:'For each finding: reproducible steps, minimal PoC, redacted evidence, and a mapping to OWASP (Web / API / LLM / MASVS) or IEC 62443. One clean proof beats mass exploitation.'});
    return phases;
  }
  function renderTargetPlan(){
    var raw=document.getElementById('tgtInput').value;
    var hint=document.getElementById('planhint');
    if(!raw.trim()){ hint.textContent='enter a domain, IP or URL first'; return; }
    var opts=[].slice.call(document.querySelectorAll('#planopts input:checked')).map(function(x){return x.value;});
    var tg=parseTarget(raw);
    var phases=buildPlan(tg,opts);
    var out='<div class="plantarget">target <span class="pk">'+esc(tg.host)+'</span> · type <span class="pk">'+tg.type+'</span> · '+phases.length+' phases</div>';
    phases.forEach(function(p,i){
      out+='<div class="planphase"><div class="ph"><span class="pn">'+(i+1)+'</span><h4>'+esc(p.t)+'</h4><span class="pt">phase '+(i+1)+'</span></div><div class="pb">';
      if(p.d)out+='<p class="pdesc">'+esc(p.d)+'</p>';
      if(p.note)out+='<div class="callout">'+p.note+'</div>';
      (p.blocks||[]).forEach(function(b){out+=b;});
      if(p.links&&p.links.length){
        out+='<div class="planlinks">'+p.links.map(function(l){return '<button class="planlink" data-go="'+l[0]+'">'+esc(l[1])+'</button>';}).join('')+'</div>';
      }
      out+='</div></div>';
    });
    var po=document.getElementById('planout'); po.innerHTML=out;
    LS.set('rb-tgt',raw);
    // wire copy buttons
    po.querySelectorAll('.copy[data-cmd]').forEach(function(btn){
      btn.addEventListener('click',function(){navigator.clipboard.writeText(decodeURIComponent(btn.dataset.cmd)).then(function(){btn.textContent='copied';btn.classList.add('ok');setTimeout(function(){btn.textContent='copy';btn.classList.remove('ok');},1200);});});
    });
    // wire module jump links
    po.querySelectorAll('.planlink[data-go]').forEach(function(b){
      b.addEventListener('click',function(){var g=b.dataset.go; show(g==='chatbot'?'chatbot':(modById(g)?'mod:'+g:'home'));});
    });
    hint.textContent='plan generated · '+phases.length+' phases';
  }
  function initPlanner(){
    var inp=document.getElementById('tgtInput'); if(!inp)return;
    var saved=LS.get('rb-tgt',''); if(saved)inp.value=saved;
    document.getElementById('genPlan').addEventListener('click',renderTargetPlan);
    inp.addEventListener('keydown',function(e){if(e.key==='Enter')renderTargetPlan();});
  }

  /* ---------- panel switching ---------- */
  var pData=document.getElementById('p-data');
  var curView='chatbot';
  function show(view){
    curView=view; LS.set('rb-last',view);
    var isChat=view==='chatbot', isAbout=view==='about', isHome=view==='home', isTarget=view==='target';
    var isData=!isChat&&!isAbout&&!isHome&&!isTarget;
    document.getElementById('p-home').classList.toggle('on',isHome);
    document.getElementById('p-target').classList.toggle('on',isTarget);
    document.getElementById('p-chatbot').classList.toggle('on',isChat);
    document.getElementById('p-about').classList.toggle('on',isAbout);
    pData.classList.toggle('on',isData);

    // sidebar active state
    modnav.querySelectorAll('.navbtn,.subnav button,.cathead').forEach(function(b){b.classList.remove('on');});
    var activeBtn=modnav.querySelector('[data-v="'+view+'"]');
    if(activeBtn)activeBtn.classList.add('on');

    if(isHome){ renderHome(); setCrumb(['Home']); }
    else if(isTarget){ setCrumb(['Engagement','Target planner']); }
    else if(isChat){ openCatGroup('ai'); setCrumb([catById('ai').label,'Chatbot / LLM runbook'],catById('ai').hue); }
    else if(isAbout){ setCrumb(['Reference','About & deploy']); }
    else if(view.indexOf('cat:')===0){
      var cid=view.slice(4); openCatGroup(cid); renderCat(cid);
    } else if(view.indexOf('mod:')===0){
      var mid=view.slice(4), m=modById(mid), c=catById(m.cat);
      openCatGroup(m.cat);
      // mark parent cathead subtle-active too
      var sub=modnav.querySelector('.subnav [data-v="mod:'+mid+'"]'); if(sub)sub.classList.add('on');
      pData.innerHTML='';
      if(!built[mid]){built[mid]=buildModule(m);}
      else built[mid]._applyFilter();
      pData.appendChild(built[mid]);
      setCrumb([c.label,m.title],c.hue);
    }
    window.scrollTo(0,0);
    if(window.innerWidth<=960)drawer(false);
  }
  function openCatGroup(cid){
    modnav.querySelectorAll('.catgrp').forEach(function(g){g.classList.toggle('open',g.dataset.cat===cid);});
  }

  modnav.addEventListener('click',function(e){
    var head=e.target.closest('.cathead');
    if(head){ var cid=head.dataset.v.slice(4); var grp=head.closest('.catgrp');
      // toggle open; navigate to landing
      if(!grp.classList.contains('open')||curView!=='cat:'+cid){ show('cat:'+cid); }
      else { grp.classList.remove('open'); }
      return; }
    var b=e.target.closest('[data-v]'); if(b)show(b.dataset.v);
  });
  // landing cards (category + module panels)
  pData.addEventListener('click',function(e){var b=e.target.closest('.ccard[data-v]'); if(b)show(b.dataset.v);});
  // home panel cards + CTA
  document.getElementById('p-home').addEventListener('click',function(e){var b=e.target.closest('[data-v]'); if(b)show(b.dataset.v);});

  /* ---------- static copy buttons (chatbot + about) ---------- */
  document.querySelectorAll('#p-chatbot .code, #p-about .code').forEach(function(block){
    var btn=block.querySelector('.copy'); if(!btn)return;
    btn.addEventListener('click',function(){navigator.clipboard.writeText(block.querySelector('pre').innerText).then(function(){btn.textContent='copied';btn.classList.add('ok');setTimeout(function(){btn.textContent='copy';btn.classList.remove('ok');},1300);});});
  });

  /* ---------- sidebar quick search (jump to a module) ---------- */
  var sbs=document.getElementById('sbsearch');
  if(sbs){
    sbs.addEventListener('input',function(){
      var q=sbs.value.trim().toLowerCase();
      modnav.querySelectorAll('.catgrp').forEach(function(g){
        var any=0;
        g.querySelectorAll('.subnav button').forEach(function(b){
          var hit=!q||b.textContent.toLowerCase().indexOf(q)>=0;
          b.style.display=hit?'':'none'; if(hit)any++;
        });
        g.style.display=(!q||any)?'':'none';
        if(q&&any)g.classList.add('open');
      });
    });
  }

  /* ---------- reset ---------- */
  document.getElementById('resetBtn').addEventListener('click',function(){
    if(!confirm('Clear all checkbox progress?'))return;
    store={}; save();
    staticItems.forEach(function(li){li.classList.remove('done');});
    pData.querySelectorAll('.row.done').forEach(function(r){r.classList.remove('done');});
    paintGlobal(); updateCounts();
  });

  /* ---------- mobile drawer ---------- */
  var side=document.getElementById('side'),scrim=document.getElementById('scrim');
  function drawer(o){side.classList.toggle('open',o);scrim.classList.toggle('on',o);}
  document.getElementById('menuBtn').addEventListener('click',function(){drawer(!side.classList.contains('open'));});
  scrim.addEventListener('click',function(){drawer(false);});

  /* ---------- init ---------- */
  buildSidebar(); paintGlobal(); updateCounts(); initPlanner();
  var last=LS.get('rb-last','home');
  // validate stored view still exists
  if(last.indexOf('mod:')===0&&!modById(last.slice(4)))last='home';
  if(last.indexOf('cat:')===0&&!catById(last.slice(4)))last='home';
  show(last);
})();
