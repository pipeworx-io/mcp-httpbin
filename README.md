# @pipeworx/httpbin

[httpbin.org](https://httpbin.org/) MCP — keyless HTTP request/response echo for debugging.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `get(query?, headers?)` — echo a GET (query/headers as JSON objects)
- `post(body?, headers?, content_type?)` — echo a POST
- `headers()` — echo caller's headers
- `ip()` — caller's IP (as gateway egress)
- `user_agent()` — caller's User-Agent
- `status(code)` — return the given HTTP status code
- `delay(seconds)` — sleep N seconds then return
- `uuid()` — return a UUID
- `base64_encode(s)` — base64-encode a string
- `base64_decode(s)` — base64-decode a string
- `json_anything()` — echo `{slideshow:…}` sample JSON
- `xml_anything()` — sample XML
- `html_anything()` — sample HTML
- `robots_txt()` — sample robots.txt
- `image(format)` — sample image (`jpeg`|`png`|`svg`|`webp`)
- `cookies()` — caller's cookies

## Data source

`https://httpbin.org`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "httpbin": {
      "url": "https://gateway.pipeworx.io/httpbin/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Httpbin data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
