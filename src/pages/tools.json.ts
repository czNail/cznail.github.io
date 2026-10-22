import { tools as catalog } from '../data/site';

export function GET() {
  const tools = catalog.map(({id,name,description,url,repository,image}) => ({id,name,description,url,repository,image}));
  return new Response(JSON.stringify({tools}), {headers: {'Content-Type':'application/json; charset=utf-8'}});
}
