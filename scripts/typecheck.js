const ts = require("typescript");
const path = require("path");

const configFile = path.resolve(__dirname, "../tsconfig.json");
const { config, error } = ts.readConfigFile(configFile, ts.sys.readFile);

if (error) {
  console.error("Config error:", ts.formatDiagnosticsWithColorAndContext([error], {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: (f) => f,
    getNewLine: () => "\n",
  }));
  process.exit(1);
}

const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configFile));
const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: {
    ...parsed.options,
    incremental: false,
    noEmit: true,
  },
});

const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length > 0) {
  const formatHost = {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: (f) => f,
    getNewLine: () => "\n",
  };
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
  console.error(`\nFound ${diagnostics.length} TypeScript error(s).`);
  process.exit(1);
} else {
  console.log(`TypeScript check passed cleanly! All ${parsed.fileNames.length} files typechecked with 0 errors.`);
  process.exit(0);
}
