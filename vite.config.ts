import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function agentesLocalStoragePlugin(): Plugin {
  const agentesDir = path.resolve(process.cwd(), 'agentes')

  return {
    name: 'agentes-local-storage',
    configureServer(server) {
      server.middlewares.use('/api/agentes', (req, res) => {
        try {
          if (!fs.existsSync(agentesDir)) {
            fs.mkdirSync(agentesDir, { recursive: true })
          }

          const urlObj = new URL(req.url || '/', 'http://localhost')

          if (req.method === 'GET') {
            const files = fs.readdirSync(agentesDir).filter(f => f.endsWith('.json'))
            const agentes = files
              .map(file => {
                try {
                  const content = fs.readFileSync(path.join(agentesDir, file), 'utf-8')
                  return JSON.parse(content)
                } catch {
                  return null
                }
              })
              .filter(Boolean)
              .sort((a, b) => {
                const tA = new Date(a.criadoEm || a.atualizadoEm || 0).getTime()
                const tB = new Date(b.criadoEm || b.atualizadoEm || 0).getTime()
                return tB - tA
              })

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(agentes))
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const data = JSON.parse(body)
                if (!data || !data.id) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'ID do agente é obrigatório' }))
                  return
                }
                const safeId = String(data.id).replace(/[^a-zA-Z0-9_-]/g, '')
                const filePath = path.join(agentesDir, `${safeId}.json`)
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true, id: safeId }))
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: String(err) }))
              }
            })
            return
          }

          if (req.method === 'DELETE') {
            const idParam = urlObj.searchParams.get('id') || urlObj.pathname.replace(/^\//, '')
            const safeId = String(idParam || '').replace(/[^a-zA-Z0-9_-]/g, '')
            if (!safeId) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'ID inválido' }))
              return
            }
            const filePath = path.join(agentesDir, `${safeId}.json`)
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
            return
          }

          res.statusCode = 405
          res.end('Method Not Allowed')
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), agentesLocalStoragePlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
