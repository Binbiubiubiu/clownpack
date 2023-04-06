import path from "path";

export { pkgPath, getCorejsVersion, getDepVersion };

const pkgPath = path.join(__dirname, "..");

/**
 *
 * @public
 */
function getCorejsVersion() {
  try {
    return getDepVersion("core-js").split(".").shift().replace(/[^0-9]/gi, "");
  } catch {
    return "3";
  }
}

function getDepVersion(name: string) {
  const pkg = require(path.join(pkgPath, "package.json"));
  return pkg.dependencies[name];
}
