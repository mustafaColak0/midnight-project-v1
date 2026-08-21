import http from 'node:http'
import https from 'node:https'

const PORT = 6300

const TARGET =
  'https://solid-space-journey-p7gxj6rjgjp3rwgj-6300.app.github.dev'

const targetUrl = new URL(TARGET)

const server = http.createServer((req, res) => {
  const origin = req.headers.origin ?? '*'

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods':
        'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':
        req.headers['access-control-request-headers'] ??
        'content-type',
      'Access-Control-Max-Age': '3600',
    })

    res.end()
    return
  }

  console.log(
    `[Proof Proxy] ${req.method} ${req.url}`,
  )

  const headers = {
    ...req.headers,
    host: targetUrl.host,
  }

  // Local origin/referer are not useful to the Codespaces tunnel.
  delete headers.origin
  delete headers.referer
  delete headers['content-length']

  const proxyReq = https.request(
    {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: 443,
      method: req.method,
      path: req.url,
      headers,
    },
    (proxyRes) => {
      console.log(
        `[Proof Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`,
      )

      const responseHeaders = {
        ...proxyRes.headers,

        'access-control-allow-origin': origin,
        'access-control-allow-methods':
          'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers':
          'content-type',
      }

      // Avoid forwarding a stale content-length if headers/body
      // are ever modified by an intermediary.
      delete responseHeaders['transfer-encoding']

      res.writeHead(
        proxyRes.statusCode ?? 500,
        responseHeaders,
      )

      proxyRes.pipe(res)
    },
  )

  proxyReq.on('error', (error) => {
    console.error(
      '[Proof Proxy] ERROR:',
      error,
    )

    if (!res.headersSent) {
      res.writeHead(502, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      })
    }

    res.end(
      JSON.stringify({
        error: 'Proof proxy failed',
        message: error.message,
      }),
    )
  })

  // Important: Midnight proof requests are binary.
  // Pipe without parsing/modifying the body.
  req.pipe(proxyReq)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('')
  console.log('========================================')
  console.log(' Midnight Lace Proof Proxy')
  console.log('========================================')
  console.log('')
  console.log(`Local:  http://localhost:${PORT}`)
  console.log(`Remote: ${TARGET}`)
  console.log('')
  console.log('Leave this terminal running.')
  console.log('')
})
