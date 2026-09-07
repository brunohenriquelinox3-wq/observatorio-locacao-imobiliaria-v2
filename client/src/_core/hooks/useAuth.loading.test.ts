import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const hook = readFileSync(resolve(import.meta.dirname, "useAuth.ts"), "utf8");
const entry = readFileSync(resolve(import.meta.dirname, "../../main.tsx"), "utf8");

describe("useAuth loading resilience", () => {
  it("terminates the visual loading state if authentication transport never settles", () => {
    expect(hook).toContain("const [authLoadingTimedOut, setAuthLoadingTimedOut] = useState(false);");
    expect(hook).toContain("window.setTimeout(() => setAuthLoadingTimedOut(true), 12_000)");
    expect(hook).toContain("meQuery.isLoading && !authLoadingTimedOut");
  });

  it("does not start a global login redirect from an arbitrary query failure", () => {
    expect(entry).not.toContain("redirectToLoginIfUnauthorized");
    expect(entry).not.toContain("startLogin();");
    expect(entry).toContain("credentials: \"include\"");
  });
});
