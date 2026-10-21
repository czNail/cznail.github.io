import { tools as catalog } from '../data/site';

export function GET() {
  const tools = catalog.map(({id,name,description,url,repository}) => ({id,name,description,url,repository}));
  return new Response(JSON.stringify({tools}), {headers: {'Content-Type':'application/json; charset=utf-8'}});
}
