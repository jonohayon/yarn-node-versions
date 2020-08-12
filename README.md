Yarn node version inconsistency
===

## Prerequisits
Install [`fnm`](http://github.com/Schniz/fnm) and install node 11 and 12 using it.

## Problem description
Yarn messes with the node binary location, and changes it for child processes. When running a child process that changes the node binary location - for example,
running `nvm use` or `fnm use` from a script that is run with `yarn` - the change won't take effect and the node binary used will be the one Yarn was using when
it first started.

## Reproduction steps
Run `fnm use 11 && npm start` to see the expected output. The `fnm use` output from within the child process started in `index.js` should match the output of
`yarn run echo-node-data`.

Run `fnm use 11 && yarn start` to see the actual output from Yarn. The `fnm use` output isn't aligned with the output of `yarn run echo-node-data` - the latter
shows node v11 but `fnm use` shows that v12 should be used.

## Explanation behind the problem
When running the yarn CLI, yarn will first try to spawn the relevant command ([code](https://github.com/yarnpkg/yarn/blob/master/src/cli/index.js#L637)). In case
that fails (for example, if the process is trying to spawn itself as a child processs), yarn will try instead to fork itself. When forking a process in node,
the `process.execPath` field (amongst other fields) will be forwarded down to the forked process, according to the [node API docs](https://nodejs.org/dist/latest-v12.x/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

Thus, when running yarn as a child process of yarn, doesn't matter how up high in the process chain, it will always use the original node binary used to spawn
the top-most yarn script, and not the PATH that's changed from the child process, [as](https://github.com/yarnpkg/yarn/blob/a3b1294c22043cd8868b6a1decb77b673e764efd/src/util/execute-lifecycle-script.js) [it](https://github.com/yarnpkg/yarn/blob/master/src/util/execute-lifecycle-script.js#L65) [uses](https://github.com/yarnpkg/yarn/blob/master/src/constants.js#L66)
`process.execPath` to determine which node binary should be used to execute things (such as package lifecycle scripts and the like).

## Possible solutions
One possible solution is putting the wanted node binary in the `NODE` environment variable, as per `util/execute-lifecycle-script.js:64`:
```javascript
const env = {
  NODE: process.execPath,
  INIT_CWD: process.cwd(),
  // This lets `process.env.NODE` to override our `process.execPath`.
  // This is a bit confusing but it is how `npm` was designed so we
  // try to be compatible with that.
  ...process.env,
};
```

This does not seem to effect all of yarn, though, but only the places where the `makeEnv` function is used. I have yet to find a full solution.
