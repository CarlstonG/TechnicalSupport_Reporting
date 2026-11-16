import { NextResponse } from 'next/server';
import { providerError } from '@/lib/provider-error';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { provider, apiKey, model, skill, content } = await request.json();
    if (!['openai','gemini','anthropic'].includes(provider) || typeof apiKey !== 'string' || !apiKey.trim() || typeof model !== 'string' || !model.trim() || typeof skill !== 'string' || !skill.trim() || typeof content !== 'string' || !content.trim()) return NextResponse.json({error:'Provider, API key, model, active Skill, and thread are required.'},{status:400});
    if (content.length>250000 || skill.length>100000) return NextResponse.json({error:'Thread or Skill is too large. Split the thread into smaller sections.'},{status:413});
    let url: string; let headers: Record<string,string>; let body: object;
    if (provider === 'anthropic') {
      url='https://api.anthropic.com/v1/messages'; headers={'x-api-key':apiKey,'anthropic-version':'2023-06-01','Content-Type':'application/json'}; body={model, max_tokens:8192, system:skill, messages:[{role:'user',content}]};
    } else if (provider === 'gemini') {
      url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`; headers={'x-goog-api-key':apiKey,'Content-Type':'application/json'}; body={system_instruction:{parts:[{text:skill}]},contents:[{role:'user',parts:[{text:content}]}]};
    } else {
      url='https://api.openai.com/v1/chat/completions'; headers={Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'}; body={model,messages:[{role:'system',content:skill},{role:'user',content}]};
    }
    const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(90000),cache:'no-store'});
    const data=await response.json();
    if (!response.ok) return NextResponse.json({error:providerError(provider,response.status,data.error?.code || data.error?.type)},{status:response.status>=500?502:400});
    const summary=provider==='openai'?data.choices?.[0]?.message?.content:provider==='anthropic'?data.content?.filter((p:{type:string})=>p.type==='text').map((p:{text:string})=>p.text).join('\n'):data.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||'').join('\n');
    if (!summary) return NextResponse.json({error:'The provider returned no text. Check model support or try again.'},{status:502});
    return NextResponse.json({summary},{headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'The request timed out or could not reach the provider. Please try again.'},{status:502}); }
}
