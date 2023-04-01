import path from "path";

export { pkgPath, getCorejsVersion, getRuntimeVersion };

const pkgPath = path.join(__dirname, "..");

function getCorejsVersion() {
  try {
    return getDepVersion("core-js").split(".").shift().replace(/[^0-9]/gi, "");
  } catch {
    return "3";
  }
}

function getRuntimeVersion() {
  return getDepVersion("@babel/runtime");
}

function getDepVersion(name: string) {
  const pkg = require(path.join(pkgPath, "package.json"));
  return pkg.dependencies[name];
}
