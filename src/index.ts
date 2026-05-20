interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * httpbin MCP.
 */


const BASE = 'https://httpbin.org';
const UA = 'pipeworx-mcp-httpbin/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'get',
    description: 'Echo a GET.',
    inputSchema: { type: 'object', properties: { query: { type: 'object' }, headers: { type: 'object' } } },
  },
  {
    name: 'post',
    description: 'Echo a POST.',
    inputSchema: {
      type: 'object',
      properties: { body: {}, headers: { type: 'object' }, content_type: { type: 'string' } },
    },
  },
  { name: 'headers', description: "Echo caller's headers.", inputSchema: { type: 'object', properties: {} } },
  { name: 'ip', description: 'Caller IP (gateway egress).', inputSchema: { type: 'object', properties: {} } },
  { name: 'user_agent', description: 'Caller User-Agent.', inputSchema: { type: 'object', properties: {} } },
  { name: 'status', description: 'Return given HTTP status.', inputSchema: { type: 'object', properties: { code: { type: 'number' } }, required: ['code'] } },
  { name: 'delay', description: 'Sleep N seconds.', inputSchema: { type: 'object', properties: { seconds: { type: 'number' } }, required: ['seconds'] } },
  { name: 'uuid', description: 'Random UUID.', inputSchema: { type: 'object', properties: {} } },
  { name: 'base64_encode', description: 'Base64 encode.', inputSchema: { type: 'object', properties: { s: { type: 'string' } }, required: ['s'] } },
  { name: 'base64_decode', description: 'Base64 decode.', inputSchema: { type: 'object', properties: { s: { type: 'string' } }, required: ['s'] } },
  { name: 'json_anything', description: 'Sample JSON.', inputSchema: { type: 'object', properties: {} } },
  { name: 'xml_anything', description: 'Sample XML.', inputSchema: { type: 'object', properties: {} } },
  { name: 'html_anything', description: 'Sample HTML.', inputSchema: { type: 'object', properties: {} } },
  { name: 'robots_txt', description: 'Sample robots.txt.', inputSchema: { type: 'object', properties: {} } },
  { name: 'image', description: 'Sample image metadata (returns URL).', inputSchema: { type: 'object', properties: { format: { type: 'string' } }, required: ['format'] } },
  { name: 'cookies', description: 'Caller cookies.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string') throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  const get = async (url: string, accept = 'application/json') => {
    const res = await fetch(url, { headers: { Accept: accept, 'User-Agent': UA } });
    const ct = res.headers.get('content-type') ?? '';
    const body = ct.includes('json') ? await res.json() : await res.text();
    return { status: res.status, content_type: ct, body };
  };
  switch (name) {
    case 'get': {
      const q = (args.query ?? {}) as Record<string, unknown>;
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(q)) p.set(k, String(v));
      const url = `${BASE}/get${[...p].length ? `?${p}` : ''}`;
      const headers: Record<string, string> = { Accept: 'application/json', 'User-Agent': UA, ...(args.headers as Record<string, string> | undefined ?? {}) };
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`httpbin: ${res.status}`);
      return res.json();
    }
    case 'post': {
      const ct = (args.content_type as string | undefined) ?? 'application/json';
      const body = ct.includes('json') ? JSON.stringify(args.body ?? null) : String(args.body ?? '');
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': ct, 'User-Agent': UA, ...(args.headers as Record<string, string> | undefined ?? {}) };
      const res = await fetch(`${BASE}/post`, { method: 'POST', headers, body });
      if (!res.ok) throw new Error(`httpbin: ${res.status}`);
      return res.json();
    }
    case 'headers':
      return get(`${BASE}/headers`);
    case 'ip':
      return get(`${BASE}/ip`);
    case 'user_agent':
      return get(`${BASE}/user-agent`);
    case 'status': {
      const code = Number(args.code ?? 200);
      const res = await fetch(`${BASE}/status/${code}`, { headers: { 'User-Agent': UA } });
      return { requested_code: code, status: res.status };
    }
    case 'delay':
      return get(`${BASE}/delay/${Number(args.seconds ?? 0)}`);
    case 'uuid':
      return get(`${BASE}/uuid`);
    case 'base64_encode':
      return get(`${BASE}/base64/${encodeURIComponent(btoa(reqStr('s', '"hello"')))}`, 'text/plain');
    case 'base64_decode':
      return get(`${BASE}/base64/${encodeURIComponent(reqStr('s', '"aGVsbG8="'))}`, 'text/plain');
    case 'json_anything':
      return get(`${BASE}/json`);
    case 'xml_anything':
      return get(`${BASE}/xml`, 'application/xml');
    case 'html_anything':
      return get(`${BASE}/html`, 'text/html');
    case 'robots_txt':
      return get(`${BASE}/robots.txt`, 'text/plain');
    case 'image':
      return { url: `${BASE}/image/${encodeURIComponent(reqStr('format', '"png"'))}` };
    case 'cookies':
      return get(`${BASE}/cookies`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
