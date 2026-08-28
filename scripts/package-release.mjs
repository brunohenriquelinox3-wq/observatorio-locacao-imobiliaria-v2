import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const tagArgumentIndex = process.argv.indexOf("--tag");
const requestedReleaseLabel = tagArgumentIndex >= 0 ? process.argv[tagArgumentIndex + 1] : process.env.RELEASE_LABEL ?? "fundacao-a0";
if (!requestedReleaseLabel || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedReleaseLabel)) {
  throw new Error("RELEASE_LABEL_INVALID");
}
const releaseLabel = requestedReleaseLabel;
const releaseName = `crm-imobiliario-${releaseLabel}`;
const outputDir = path.resolve("/home/ubuntu/Downloads", "crm-imobiliario-entregas");
const sourceDirectory = path.join(outputDir, `${releaseName}-codigo-fonte`);
const sourceZip = path.join(outputDir, `${releaseName}-codigo-fonte.zip`);
const standaloneHtml = path.join(outputDir, `${releaseName}.html`);
const distDirectory = path.join(root, "dist", "public");

const excludedRoots = new Set([
  ".git",
  ".manus-logs",
  "node_modules",
  "dist",
  "coverage",
  "releases",
]);

const excludedFiles = new Set([
  ".project-config.json",
]);

function isIncluded(source) {
  const relative = path.relative(root, source);
  if (!relative || relative.startsWith("..")) return true;
  const [first] = relative.split(path.sep);
  if (excludedRoots.has(first)) return false;
  const basename = path.basename(source);
  return !basename.startsWith(".env") && !excludedFiles.has(basename);
}

function inlineBuildAssets(indexHtml, files) {
  return indexHtml
    .replace(/<link([^>]*?)href="(\/assets\/[^\"]+\.css)"([^>]*)>/g, (tag, before, href, after) => {
      const css = files.get(href);
      return css ? `<style data-release-asset="${path.basename(href)}">${css}</style>` : tag;
    })
    .replace(/<script([^>]*?)src="(\/assets\/[^\"]+\.js)"([^>]*)><\/script>/g, (tag, before, src) => {
      const script = files.get(src);
      return script ? `<script type="module" data-release-asset="${path.basename(src)}">${script}</script>` : tag;
    });
}

async function readBuildAssets(indexHtml) {
  const references = [
    ...indexHtml.matchAll(/(?:href|src)="(\/assets\/[^\"]+\.(?:css|js))"/g),
  ].map((match) => match[1]);
  const files = new Map();
  for (const reference of references) {
    const content = await readFile(path.join(distDirectory, reference), "utf8");
    files.set(reference, content);
  }
  return files;
}

async function main() {
  const indexPath = path.join(distDirectory, "index.html");
  const indexHtml = await readFile(indexPath, "utf8");
  const assets = await readBuildAssets(indexHtml);

  await mkdir(outputDir, { recursive: true });
  await rm(sourceDirectory, { recursive: true, force: true });
  await rm(sourceZip, { force: true });
  await rm(standaloneHtml, { force: true });

  await cp(root, sourceDirectory, { recursive: true, filter: isIncluded });
  await writeFile(
    path.join(sourceDirectory, "ENTREGA_UPLOAD.md"),
    `# ${releaseName}\n\n` +
      "Este ZIP contém o código-fonte deste marco, sem arquivos .env, segredos, node_modules, logs ou builds anteriores. " +
      "Para uma plataforma com build, use Node 22, execute `pnpm install --frozen-lockfile` e `pnpm run build:netlify`. " +
      "O publish é `dist/public` e as functions são lidas de `netlify/functions`, conforme `netlify.toml`. " +
      "O HTML autônomo acompanha esta entrega como artefato de visualização; ele não ativa comandos administrativos nem substitui o servidor.\n",
    "utf8",
  );
  await writeFile(standaloneHtml, inlineBuildAssets(indexHtml, assets), "utf8");
  await execFileAsync("zip", ["-qr", sourceZip, "."], { cwd: sourceDirectory });

  console.log(`ZIP=${sourceZip}`);
  console.log(`HTML=${standaloneHtml}`);
}

await main();
