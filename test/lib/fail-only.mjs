import { promises as fs } from 'fs';
import path from 'path';

export default {
  name: 'fail-only',
  async transform(context) {
    const filePath = context.path;
    const failOnlyEnabled = process.argv.includes('--fail-only');
    if (failOnlyEnabled && filePath.match(/^\/test\/[^/]+\.js$/)) {
      const fileContent = await fs.readFile(`.${filePath}`, 'utf-8');
      if (/\bit\.only\b/.test(fileContent)) {
        abort(`--fail-only:\nFound 'it.only' in ${filePath}. Remove it to proceed.`);
      }
    }
  },
};

function abort(message) {
  const RED = '\x1b[31m'; // Red color code
  const RESET = '\x1b[0m'; // Reset color code
  process.stderr.write(`${RED}${message}\n${RESET}`, () => {
    process.exit(1);
  });
}
