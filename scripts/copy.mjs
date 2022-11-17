import { existsSync } from 'fs'
import { readdir, copyFile, mkdir, lstat } from 'fs/promises'
import { basename, dirname, extname, resolve, join } from 'path'

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

const copyFiles = async (from, to) => {
  // to absolute paths
  to = join(resolve(), to)
  from = join(resolve(), from)

  const stat = await lstat(from)
  if (stat.isFile()) {
    await copyFile(from, to)
    return
  }

  for await (const file of getFiles(from)) {
    // not .ts or .tsx
    if (!file.match(/tsx?$/gm)) {
      // set variables
      const newFile = file.replace(from, to)
      const directory = dirname(newFile)

      // create directory (if non existing)
      if (!existsSync(directory)) await mkdir(directory, { recursive: true })

      // copy file
      await copyFile(file, newFile)
    }
  }
}

const main = async () => {
  await copyFiles('icon', 'dist/icon')
  await copyFiles('css', 'dist/css')
  await copyFiles('quilljs', 'dist/quilljs')
  await copyFiles('chartjs', 'dist/chartjs')
  await copyFiles('index.html', 'dist/index.html')
}

main()
