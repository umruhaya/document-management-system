import 'reflect-metadata'
import fs from 'node:fs/promises'
import * as path from 'node:path'
import process, { stdin as input, stdout as output } from 'node:process'
import readline from 'node:readline/promises'
import cliProgress from 'cli-progress'
import { Command } from 'commander'
import mime from 'mime'
import pLimit from 'p-limit'
import { DocumentService } from '~/app/services/document.service'
import { UserService } from '~/app/services/user.service'
import { container } from '~/infra/container'
import type { FilestoreStrategy } from '~/infra/file-stores/filestore.strategy'
import logger from '~/infra/logger'

const userService = container.resolve(UserService)
const documentService = container.resolve(DocumentService)
const documentStore = container.resolve<FilestoreStrategy>('FilestoreStrategy')

const limit = pLimit(20)

export const downloadCommand = new Command('download')
	.description(`Download all the user's documents to a specified directory after logging in.
  
Usage:
  pnpm docs:download --username <username> <directory>

Examples:
  pnpm docs:download --username alice ./downloads

Options:
  --username <username>    Required. Login username.

Arguments:
  <directory>    Required. Destination folder to save downloaded files.
  `)
	.requiredOption('--username <username>', 'Login username')
	.argument('<directory>', 'Destination directory for downloaded documents')
	.action(async (directory: string, options) => {
		await assertCanWriteOrCreate(directory)

		// Prompt password securely
		const password = await promptPassword()

		const authRes = await userService.login({
			username: options.username,
			password,
		})
		authRes
			.flatMap((user) =>
				documentService.search({
					userId: user.id,
					searchOptions: {},
					paginationOptions: { page: 1, limit: 1000 },
				}),
			)
			.map(async (docs) => {
				const total = docs.data.length
				const bar = new cliProgress.SingleBar(
					{
						format: 'Downloading [{bar}] {percentage}% | {value}/{total} files',
					},
					cliProgress.Presets.shades_classic,
				)
				bar.start(total, 0)
				console.log({ total })
				const docSavePromises = docs.data.map(async (doc) =>
					limit(async () => {
						const contentRes = await documentStore.fetchContent(doc.documentId)
						const ext = mime.getExtension(doc.fileType) ?? 'bin'
						await contentRes
							.map(async (content) => {
								const filePath = path.join(directory, `${doc.documentId}.${ext}`)
								await fs
									.mkdir(path.dirname(filePath), { recursive: true })
									.then(() => fs.writeFile(filePath, content))
									.catch(logger.error)
							})
							.toPromise()
						bar.increment()
					}),
				)
				await Promise.all(docSavePromises)
			})
			.map(() => {
				process.exit(0)
			})
			.mapErr((err) => {
				console.error(err.message)
				process.exit(1)
			})
	})

export async function promptPassword(): Promise<string> {
	const rl = readline.createInterface({ input, output })
	const password = await rl.question('Password: ')
	rl.close()
	return password
}

async function assertCanWriteOrCreate(dir: string) {
	try {
		// Check if directory exists
		await fs.access(dir)
		// Exists: check for write access
		await fs.access(dir, fs.constants.W_OK)
		return
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			// Directory does not exist -- check if parent is writable
			const parent = path.dirname(dir)
			if (parent === dir) {
				exitWithPermError(dir)
			}
			try {
				await fs.access(parent, fs.constants.W_OK)
				// Parent is writable; directory can be created
				return
			} catch (parentErr: any) {
				if (parentErr.code === 'EACCES') {
					exitWithPermError(parent)
				} else if (parentErr.code === 'ENOENT') {
					// Parent doesn't exist! Recursively check up the tree
					await assertCanWriteOrCreate(parent)
					return
				}
				throw parentErr
			}
		} else if (err.code === 'EACCES') {
			exitWithPermError(dir)
		}
		throw err
	}
}

function exitWithPermError(dir: string) {
	console.error(
		`\x1b[31mPermission error: Cannot write to or create directory "${dir}".\x1b[0m\n` +
			`Please run with "sudo", choose another directory,\n` +
			`or configure permissions (e.g. via "chown" or "chmod").\n`,
	)
	process.exit(1)
}

downloadCommand.parse(process.argv)
