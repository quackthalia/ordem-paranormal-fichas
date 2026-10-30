import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function sanitizarNomeArquivo(nome: unknown, fallbackId: string): string {
  const limpo = String(nome || '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .replace(/\.+$/, '')
  return limpo || `Agente_${String(fallbackId || '').slice(0, 8) || 'sem_nome'}`
}

function agentesLocalStoragePlugin(): Plugin {
  const agentesDir = path.resolve(process.cwd(), 'agentes')

  return {
    name: 'agentes-local-storage',
    configureServer(server) {
      // Impede que o watcher do Vite recarregue a página quando arquivos .json em ./agentes forem salvos
      server.watcher.unwatch([
        agentesDir,
        path.join(agentesDir, '**'),
        '**/agentes/**',
      ])

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

                const safeId = String(data.id)
                const baseName = sanitizarNomeArquivo(data.nomePersonagem || data.nomeEditando, safeId)

                // Encontra arquivo anterior deste mesmo agente (mesmo data.id)
                const files = fs.readdirSync(agentesDir).filter(f => f.endsWith('.json'))
                let arquivoAntigo: string | null = null

                for (const file of files) {
                  const fullPath = path.join(agentesDir, file)
                  try {
                    const raw = fs.readFileSync(fullPath, 'utf-8')
                    const parsed = JSON.parse(raw)
                    if (parsed && parsed.id === data.id) {
                      arquivoAntigo = fullPath
                      break
                    }
                  } catch {
                    // ignora erros de leitura
                  }
                }

                // Determina nome de arquivo evitando conflito com outros agentes
                let targetName = `${baseName}.json`
                let targetPath = path.join(agentesDir, targetName)
                let counter = 1

                while (fs.existsSync(targetPath)) {
                  // Se o arquivo neste caminho for do próprio agente, pode reutilizar/sobrescrever
                  if (arquivoAntigo && path.resolve(arquivoAntigo) === path.resolve(targetPath)) {
                    break
                  }
                  try {
                    const raw = fs.readFileSync(targetPath, 'utf-8')
                    const parsed = JSON.parse(raw)
                    if (parsed && parsed.id === data.id) {
                      break
                    }
                  } catch {}
                  counter++
                  targetName = `${baseName} (${counter}).json`
                  targetPath = path.join(agentesDir, targetName)
                }

                // Se o agente foi renomeado e o arquivo anterior tinha outro nome, remove o anterior
                if (arquivoAntigo && path.resolve(arquivoAntigo) !== path.resolve(targetPath)) {
                  try {
                    fs.unlinkSync(arquivoAntigo)
                  } catch {}
                }

                // Evita escrita desnecessária no disco se nada mudou além de atualizadoEm
                let deveEscrever = true
                if (fs.existsSync(targetPath)) {
                  try {
                    const atualRaw = fs.readFileSync(targetPath, 'utf-8')
                    const atualObj = JSON.parse(atualRaw)
                    const aLimpo = JSON.stringify({ ...atualObj, atualizadoEm: '' })
                    const bLimpo = JSON.stringify({ ...data, atualizadoEm: '' })
                    if (aLimpo === bLimpo) {
                      deveEscrever = false
                    }
                  } catch {
                    deveEscrever = true
                  }
                }

                if (deveEscrever) {
                  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8')
                }

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true, id: safeId, arquivo: targetName }))
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
            if (!idParam) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'ID inválido' }))
              return
            }

            const files = fs.readdirSync(agentesDir).filter(f => f.endsWith('.json'))
            let deletou = false

            for (const file of files) {
              const fullPath = path.join(agentesDir, file)
              if (file === `${idParam}.json`) {
                try {
                  fs.unlinkSync(fullPath)
                  deletou = true
                } catch {}
                continue
              }
              try {
                const raw = fs.readFileSync(fullPath, 'utf-8')
                const parsed = JSON.parse(raw)
                if (parsed && parsed.id === idParam) {
                  fs.unlinkSync(fullPath)
                  deletou = true
                }
              } catch {}
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, deletou }))
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
  server: {
    watch: {
      ignored: ['**/agentes/**'],
    },
  },
})
