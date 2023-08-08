import dotenv from 'dotenv'
dotenv.config()

import { Command } from 'commander'
import walk from 'ignore-walk'
import fs from 'fs'
import openaiPrompt from './util/gpt3.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const program = new Command()

program.name('autoci-util').description('CLI for auto-ci').version('0.8.0')

program
  .command('gen-changes')
  .argument('<prompt>')
  .action((prompt) => {
    console.log('path info', __filename, __dirname, path.join(__dirname, '..'))
    const files = walk.sync({
      path: path.join(__dirname, '..'),
      ignoreFiles: ['.gitignore', '.autoci-ignore'],
    })
    console.log('files', files)
    const [summary, targetFilePath, targetFileContents] = files.reduce(
      (acc, fp, i) => {
        fs.readFile(fp, 'utf-8', (error, data) => {
          if (error) {
            console.error(error)
            return
          }
          if (fp.endsWith('test.js') && !data.startsWith(`/**\n${prompt}\n*/\n`)) {
            data = `/**\n${prompt}\n*/\n${data}`
            console.log('modified: ' + fp)
          }

          fs.writeFile(fp, data, (error) => {
            if (error) {
              console.error(error)
            } else {
              console.log('this file has been modified: ' + fp)
            }
          })
        })

        return ['', '']
      },
      ['', ''],
    )
    // openaiPrompt('test1', prompt).then(async (response) => {
    //     console.log('response', response.data.choices)
    //     return response.data.choices
    // });
  })

program.parse()
