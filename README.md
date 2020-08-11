Yarn node version inconsistency
===

## Prerequisits
Install [`fnm`](http://github.com/Schniz/fnm) and install node 11 and 12 using it.

## Problem description
Yarn messes with the node binary location, and changes it for child processes. When running a child process that changes the node binary location - for example, running `nvm use` or `fnm use` from a script that is run with `yarn` - the change won't take effect and the node binary used will be the one Yarn was using when it first started.

## Reproduction steps
Run `fnm use 11 && npm start` to see the expected output. The `fnm use` output from within the child process started in `index.js` should match the output of `yarn run echo-node-data`.

Run `fnm use 11 && yarn start` to see the actual output from Yarn. The `fnm use` output isn't aligned with the output of `yarn run echo-node-data` - the latter shows node v11 but `fnm use` shows that v12 should be used.
