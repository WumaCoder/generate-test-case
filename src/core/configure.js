const { resolve } = require("path");

function configure(cliOptions, filePath) {
  const defaultConfig = {
    root: ".",
    compile: "",
    exec: "node",

    compileFilePath: "./source.js",
    execFilePath: "",
    source: "",
    injectLibs: [],

    stdinTemplatePath: "./template",
    stdinTemplate: "",

    outDir: "./data",
    count: 10,
  };
  const envConfig = getEnvConfig();
  const configFile = getConfigFile(filePath);
  const config = Object.assign(
    defaultConfig,
    configFile,
    envConfig,
    cliOptions
  );

  config.count = Number(config.count);

  // @ts-ignore
  globalThis.config = config;

  return config;
}
function getEnvConfig() {
  return Object.keys(process.env).reduce((prev, current) => {
    if (current.includes("GTC")) {
      prev[toCamel(current.substr(4))] = process.env[current];
    }
    return prev;
  }, {});
}

function toCamel(str = "") {
  return str.toLowerCase().replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
}

function getConfigFile(filePath) {
  if (!filePath) return {};
  try {
    return require(resolve("./", filePath));
  } catch (err) {
    return {};
  }
}

module.exports = { configure };
