#!/usr/bin/env node
/**
 * 独立启动器 —— 不限环境版
 *
 * 设计目标：
 *   1. 完全不依赖 DeepSeek Harness（DSH），也绝不写入 ~/.dsh 下的任何配置。
 *   2. 所有运行时数据（profile / 工程 / 上传素材）都锁在「本包所在目录」内。
 *   3. 跨平台：只要装了 Node>=20 即可（Windows / macOS / Linux 通用）。
 *
 * 用法：
 *   node start.mjs            启动并尝试自动打开浏览器
 *   node start.mjs --no-open  仅启动服务，不自动打开浏览器
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'

const APP_DIR = dirname(fileURLToPath(import.meta.url))
const runner = join(APP_DIR, 'scripts', 'dsh-runner.mjs')

if (!existsSync(runner)) {
  console.error('[启动器] 找不到 scripts/dsh-runner.mjs，部署不完整。')
  process.exit(1)
}
if (!existsSync(join(APP_DIR, 'node_modules'))) {
  console.error('[启动器] 依赖尚未安装，请先在包目录执行： npm install')
  process.exit(1)
}

// 关键隔离设置：
//  - DSH_VIDEO_HOME 指向包根 -> REPO_ROOT = 包根，所有数据写入包目录内，
//    不会落到 ~/.dsh/video-workbench，更不会碰 ~/.dsh/profiles/desktop。
//  - DSH_HOME / DSH_CLIENT_HOME 指向包内隔离目录 -> llm-client 的 DSH 配置发现逻辑
//    只读取包内的 cordis.patch.yml / .credentials.yaml，绝不读取用户真实 ~/.dsh 的凭证。
//  - 清空 DSH_APP_ROOT -> 即使传 --dsh-native 也找不到 dsh.cmd，杜绝触发原生 DSH CLI。
//  - DSH_VIDEO_WORKSPACE 固定在包内 projects/ 目录。
const ISOLATED_DSH_HOME = join(APP_DIR, '.dsh-home')
const env = {
  ...process.env,
  DSH_VIDEO_HOME: APP_DIR,
  DSH_HOME: ISOLATED_DSH_HOME,
  DSH_CLIENT_HOME: ISOLATED_DSH_HOME,
  DSH_APP_ROOT: '',
  DSH_VIDEO_WORKSPACE: join(APP_DIR, 'projects'),
}

const args = [runner, 'video', '--keep-alive']
if (!process.argv.includes('--no-open')) args.push('--open')

console.log('[启动器] 工作目录：', APP_DIR)
console.log('[启动器] 隔离根目录(DSH_VIDEO_HOME)：', env.DSH_VIDEO_HOME)
console.log('[启动器] 启动命令： node', args.join(' '))

const child = spawn(process.execPath, args, { cwd: APP_DIR, env, stdio: 'inherit' })
child.on('error', (err) => {
  console.error('[启动器] 子进程启动失败：', err)
  process.exit(1)
})
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 0)
})
