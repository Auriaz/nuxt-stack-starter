import fs from 'node:fs'
import path from 'node:path'

const TAG_PATTERN = /(TODO|FIXME|BUG|HACK|NOTE|OPTIMIZE|PERF|SECURITY)/
const TAG_PARSE = /(TODO|FIXME|BUG|HACK|NOTE|OPTIMIZE|PERF|SECURITY)(?:\[(?<meta>[^\]]+)\])?:?\s?(?<text>.*)?/
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.output', 'dist', 'reports', '.cursor'])
const MAX_FILE_SIZE_BYTES = 1_000_000

const root = process.cwd()
const results = []
const jsonResults = []

function shouldSkipPath(filePath) {
  const parts = filePath.split(path.sep)
  if (parts.some(part => EXCLUDE_DIRS.has(part))) {
    return true
  }
  const contentIndex = parts.indexOf('content')
  if (contentIndex !== -1 && parts[contentIndex + 1] === 'docs') {
    return true
  }
  return false
}

function scanDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (shouldSkipPath(fullPath)) {
      continue
    }
    if (entry.isDirectory()) {
      scanDir(fullPath)
      continue
    }
    if (!entry.isFile()) {
      continue
    }
    const stat = fs.statSync(fullPath)
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      continue
    }
    let content = ''
    try {
      content = fs.readFileSync(fullPath, 'utf8')
    } catch {
      continue
    }
    const lines = content.split(/\r?\n/)
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (TAG_PATTERN.test(line)) {
        const relativePath = path.relative(root, fullPath)
        results.push(`${relativePath}:${index + 1}:${line}`)

        const parsed = TAG_PARSE.exec(line)
        const tag = parsed?.[1] ?? null
        const metaRaw = parsed?.groups?.meta ?? ''
        const text = parsed?.groups?.text ?? ''
        const meta = {}
        if (metaRaw) {
          for (const entry of metaRaw.split(',')) {
            const [key, value] = entry.split('=').map(part => part.trim())
            if (key && value) {
              meta[key] = value
            }
          }
        }
        jsonResults.push({
          file: relativePath,
          line: index + 1,
          tag,
          meta,
          text: text || line,
          raw: line
        })
      }
    }
  }
}

scanDir(root)

const reportDir = path.join(root, 'reports')
fs.mkdirSync(reportDir, { recursive: true })

results.sort((a, b) => a.localeCompare(b))
fs.writeFileSync(path.join(reportDir, 'todo-tree.md'), results.join('\n'), 'utf8')
fs.writeFileSync(path.join(reportDir, 'todo-tree.json'), JSON.stringify(jsonResults, null, 2), 'utf8')
