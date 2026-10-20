import catalog from '../data/tools.json';

export function GET() {
  const tools = catalog.filter(tool => tool.status === 'available' && tool.url).map(({id,name,description,url}) => ({id,name,description,url}));
  return new Response(JSON.stringify({tools}), {headers: {'Content-Type':'application/json; charset=utf-8'}});
}
