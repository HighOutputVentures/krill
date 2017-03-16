import krill from '../../index';

/* set globals */
process.chdir(__dirname);
global.Service = krill;

if (process.env.APP_MODE !== 'testing') { krill.start(); }

process.on('SIGTERM', () => {
  krill.stop().then(() => { process.exit(0); });
});
