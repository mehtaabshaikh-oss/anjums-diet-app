import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiDir = path.join(__dirname, '../src/app/api/admin')

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

const importStmt = "import { requireAdmin } from '@/lib/auth/requireAdmin'"
const authCheck = `\n  const adminAuth = await requireAdmin()\n  if (!adminAuth.authorized) return adminAuth.response\n`

walkDir(apiDir, filePath => {
  if (!filePath.endsWith('.ts')) return
  let content = fs.readFileSync(filePath, 'utf-8')

  if (content.includes('requireAdmin')) return // already added

  let modified = false
  // /([\s\S]*?)/ is used to match across newlines
  content = content.replace(/(export async function (?:GET|POST|PUT|PATCH|DELETE)\([\s\S]*?\)\s*\{)/g, (match) => {
    modified = true
    return match + authCheck
  })

  if (modified) {
    // simpler import injection
    let lines = content.split('\n')
    let lastImportIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i
      }
    }
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importStmt)
    } else {
      lines.unshift(importStmt)
    }

    fs.writeFileSync(filePath, lines.join('\n'))
    console.log('Processed', filePath)
  }
})
