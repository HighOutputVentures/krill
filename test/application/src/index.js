import krill from '../../..';

/* set globals */
process.chdir(__dirname);
global.delay = async(time) => {
  return new Promise((resolve) => { setTimeout(resolve, time); });
}

if (process.env.APP_MODE !== 'testing') { krill.start(); }

process.on('SIGTERM', () => {
  krill.stop().then(() => { process.exit(0); });
});
