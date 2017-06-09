import krill from '../../..';

/* set globals */
process.chdir(__dirname);

if (process.env.APP_MODE !== 'testing') { krill.start(); }

process.on('SIGTERM', () => {
  krill.stop().then(() => { process.exit(0); });
});
