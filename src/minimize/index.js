const fs = require('fs');
const path = require('path');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

(async function () {
  console.log('rn_rich_editor: making bundle...');

  // create a Rollup bundle
  const bundle = await rollup({
    input: path.resolve(`${__dirname}/needToBundle.js`),
    plugins: [
      nodeResolve(),
      // minify the output using the `terser` plugin
      terser({
        format: {
          comments: false,
          quote_style: 1,
        },
      }),
    ],
  });

  // write the output bundle to a file
  const outputTempPath = path.resolve(`${__dirname}/bundle.temp.txt`);
  await bundle.write({
    file: outputTempPath,
    format: 'iife',
    name: 'window',
    extend: true,
  });

  let bundleString = fs.readFileSync(outputTempPath, 'utf8');
  // remove output temp file
  fs.unlinkSync(outputTempPath);

  // mirror all backslashes
  bundleString = bundleString.replace(/\\/g, '\\\\');
  // mirror all backtick quotes and template literals
  bundleString = bundleString.replace(/`/g, '\\`');
  bundleString = bundleString.replace(/(\${)/g, '\\${');
  // wrap with js constant variable
  bundleString = `/* eslint-disable no-irregular-whitespace */\n/* eslint-disable max-len */\nexport const core = \`\n${bundleString}\`;\n`;

  fs.writeFile(path.resolve(`${__dirname}/../html/scripts/core.min.js`), bundleString, err => {
    if (err) console.log('rn_rich_editor ERROR: ', err);
    else {
      console.log('rn_rich_editor: bundle was successfully built!');
    }
  });
})();
