const { spawnSync } = require('child_process')

const fnmCommand = (cmd, args = []) => {
  const { stdout, stderr } = spawnSync('fnm', [cmd, ...args])
  if (stderr && stderr.toString()) {
    console.log(`!!!! ERROR !!!!\n${stderr.toString()}`)
    return
  }
  return stdout.toString().trim()
}
const fnmUse = version => fnmCommand('use', [version])
const fnmExec = (cmd, args) => fnmCommand('exec', ['--', cmd, ...args])
const fnmCurrent = () => fnmCommand('current')

const currentVersion = fnmCurrent()
console.log(`Current fnm node version: ${currentVersion}`)

;[
  () => fnmUse('12'),
  () => fnmExec('yarn', ['run', 'echo-node-data']),
].forEach(fn => console.log(fn()))
