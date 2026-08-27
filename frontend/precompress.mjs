/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Generates brotli (.br) and gzip (.gz) siblings for the text-based static
 * assets of the production build, so a reverse proxy that supports
 * precompressed sidecar files (e.g. Caddy's `file_server precompressed`)
 * can serve the densest encoding without compressing at request time.
 *
 * Usage: node precompress.mjs <directory>
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

const COMPRESSIBLE_EXTENSIONS = new Set(['.js', '.css', '.json', '.svg', '.txt', '.html', '.xml'])
const MIN_SIZE_BYTES = 1024

const rootDir = process.argv[2]
if (!rootDir) {
  console.error('usage: node precompress.mjs <directory>')
  process.exit(1)
}

let compressedFiles = 0

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (!COMPRESSIBLE_EXTENSIONS.has(extname(entry)) || stats.size < MIN_SIZE_BYTES) {
      continue
    }
    const content = readFileSync(fullPath)
    const brotli = brotliCompressSync(content, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
        [constants.BROTLI_PARAM_SIZE_HINT]: content.length
      }
    })
    const gzip = gzipSync(content, { level: constants.Z_BEST_COMPRESSION })
    if (brotli.length < content.length) {
      writeFileSync(`${fullPath}.br`, brotli)
    }
    if (gzip.length < content.length) {
      writeFileSync(`${fullPath}.gz`, gzip)
    }
    compressedFiles++
  }
}

walk(rootDir)
console.log(`🦔 > Precompressed ${compressedFiles} static assets in ${rootDir}`)
