import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { loadEnv, REPO_ROOT, resolveEnvPath } from '../packages/shared/index.js'

// STANDALONE BUILD: This deployment is intentionally environment-agnostic and never
// writes into a real DeepSeek Harness (DSH) installation under the user home directory.
// All profile scaffolding stays inside the local `.dsh-home` folder of this bundle.

export function ensureWorkspaceLinks() {
  // No cross-package junction links required: every import is a relative ESM path.
}

/**
 * Set up the `video` profile and mount the single self-contained `dsh-video-workbench` bundle
 * into the user's DeepSeek Harness `desktop` profile cleanly without duplicate rows or `workspace:*` links.
 */
export function setupDshVideoProfile() {
  ensureWorkspaceLinks()
  loadEnv()
  const dshHome = resolveEnvPath('DSH_VIDEO_HOME', './.dsh-home')
  const videoProfileDir = join(dshHome, 'profiles', 'video')
  mkdirSync(videoProfileDir, { recursive: true })

  // Keep standalone `video` runner explicit plugin paths
  const pluginPaths = [
    join(REPO_ROOT, 'packages', 'dsh-preset-video', 'index.js').replace(/\\/g, '/'),
    join(REPO_ROOT, 'packages', 'dsh-web-video-workbench', 'lib', 'index.js').replace(/\\/g, '/'),
  ]

  const patchYml = [
    'plugins:',
    "  - path: '@deepseek-ai/dsh-web-app'",
    ...pluginPaths.map((p) => `  - path: '${p}'`),
    '',
  ].join('\n')

  const profilePatchPath = join(videoProfileDir, 'cordis.patch.yml')
  writeFileSync(profilePatchPath, patchYml, 'utf8')

  const profilePkgPath = join(videoProfileDir, 'package.json')
  if (!existsSync(profilePkgPath)) {
    writeFileSync(
      profilePkgPath,
      JSON.stringify(
        {
          name: 'dsh-profile-video',
          private: true,
          type: 'module',
        },
        null,
        2,
      ) + '\n',
      'utf8',
    )
  }

  // STANDALONE BUILD: intentionally do NOT touch ~/.dsh/profiles/desktop.
  // The original upstream logic mounted this bundle into a real DSH installation;
  // that behaviour is disabled here so the workbench stays fully self-contained.
  const desktopMounted = false
  const desktopPatchPath = ''
  const desktopPkgPath = ''

  return {
    dshHome: resolve(dshHome),
    videoProfileDir,
    profilePatchPath,
    desktopMounted,
    desktopPatchPath,
    desktopPkgPath,
    pluginPaths,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(join(REPO_ROOT, 'scripts', 'install-profile.mjs'))) {
  const res = setupDshVideoProfile()
  console.log('[setup:profile] Configured DSH `video` profile:', JSON.stringify(res, null, 2))
}
