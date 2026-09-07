import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("internal route loading", () => {
  it("keeps the public home eager while loading internal modules on demand", async () => {
    const app = await readFile(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(app).toContain('import Home from "./pages/Home"');
    expect(app).toContain('lazy(() => import("./pages/PlatformAdmin"))');
    expect(app).toContain('lazy(() => import("./pages/OrganizationAdmin"))');
    expect(app).toContain('import SubdivisionFoundation from "./pages/SubdivisionFoundation";');
    expect(app).not.toContain('lazy(() => import("./pages/SubdivisionFoundation"))');
    expect(app).toContain('lazy(() => import("./pages/UrbanPipeline"))');
    expect(app).toContain('lazy(() => import("./pages/RentalPipeline"))');
    expect(app).toContain("<Suspense fallback={<RouteLoading />}>");
  });

  it("keeps activation handling before route rendering", async () => {
    const app = await readFile(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(app).toContain("activationPathForPasswordFlow");
    expect(app).toContain('path={"/ativar-conta"}');
  });
});
