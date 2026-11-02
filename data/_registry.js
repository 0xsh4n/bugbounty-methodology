/* registry — loaded before every data/*.js file. Each data file calls RB.add(module). */
window.RB = {
  mods: [],
  add: function(m){ this.mods.push(m); },
  /* ordered top-level categories. icon = inline SVG path(s), currentColor-stroked. */
  cats: [
    {id:'ai',      label:'AI / LLM',     hue:'var(--c-ai)',
      icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.3"/><circle cx="5" cy="6" r="1.6"/><circle cx="19" cy="6" r="1.6"/><circle cx="5" cy="18" r="1.6"/><circle cx="19" cy="18" r="1.6"/><path d="M6.4 7 10.2 10.4M17.6 7 13.8 10.4M6.4 17l3.8-3.4M17.6 17l-3.8-3.4"/></svg>'},
    {id:'web',     label:'Web',          hue:'var(--c-web)',
      icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>'},
    {id:'android', label:'Android',      hue:'var(--c-android)',
      icon:'<svg viewBox="0 0 24 24"><rect x="6" y="8" width="12" height="11" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2M9 4 8 2M15 4l1-2"/></svg>'},
    {id:'ios',     label:'iOS',          hue:'var(--c-ios)',
      icon:'<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M10.5 18.5h3"/></svg>'},
    {id:'thick',   label:'Thick Client', hue:'var(--c-thick)',
      icon:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>'},
    {id:'cloud',   label:'Cloud',        hue:'var(--c-cloud)',
      icon:'<svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.5 3.5 0 0 1 18 18H7Z"/></svg>'},
    {id:'ot',      label:'OT / ICS',     hue:'var(--c-ot)',
      icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>'}
  ],
  /* severity + stack display helpers */
  sevName: {crit:'Critical',high:'High',med:'Medium',low:'Low',info:'Info'},
  stackName: {php:'PHP',node:'Node.js',js:'JavaScript',react:'React',nextjs:'Next.js',
    python:'Python',java:'Java',dotnet:'.NET',ruby:'Ruby',graphql:'GraphQL',rest:'REST',
    mongodb:'MongoDB',jwt:'JWT',ws:'WebSocket',solidity:'Solidity',evm:'EVM',
    kotlin:'Kotlin',swift:'Swift',objc:'Obj-C',azure:'Azure',aws:'AWS',gcp:'GCP',
    electron:'Electron',cpp:'C/C++',
    openai:'OpenAI',anthropic:'Anthropic',langchain:'LangChain',llamaindex:'LlamaIndex',
    mcp:'MCP',pinecone:'Pinecone',huggingface:'HuggingFace'},
  stackHue: {php:'#8892c0',node:'#8cc265',react:'#61dafb',nextjs:'#bbbbbb',python:'#ffd43b',
    java:'#e76f51',dotnet:'#a179dc',ruby:'#d64b4b',graphql:'#e535ab',aws:'#ff9900',azure:'#3b9edf',
    electron:'#9feaf9',solidity:'#aa7fe0',openai:'#10a37f',anthropic:'#d4a27f',langchain:'#1c9b7c',
    mcp:'#d08770',llamaindex:'#d98cc0',huggingface:'#ffce45',pinecone:'#4da3ff'}
};
