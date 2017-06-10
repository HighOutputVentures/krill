import krill from '../../..';

/* set globals */
process.chdir(__dirname);
global.delay = async(time) => {
  return new Promise((resolve) => { setTimeout(resolve, time); });
}

krill.start();

process.on('SIGTERM', () => {
  krill.stop().then(() => { process.exit(0); });
});
