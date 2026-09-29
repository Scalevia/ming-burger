import { describe, expect, it } from "vitest";
import ar from "./ar.json";
import en from "./en.json";
import { dirFor, langFromPath } from "./index";

function keyPaths(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? keyPaths(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("dictionaries", () => {
  it("ar and en define exactly the same keys", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(ar).sort());
  });
  it("have no empty strings", () => {
    for (const dict of [ar, en]) {
      const values = JSON.stringify(dict).match(/:""/g);
      expect(values).toBeNull();
    }
  });
});

describe("language helpers", () => {
  it.each([
    ["/en", "en"],
    ["/en/menu", "en"],
    ["/ar", "ar"],
    ["/", "ar"],
    ["/admin/orders", "ar"],
    ["/english", "ar"],
  ])("langFromPath(%s) = %s", (path, lang) => expect(langFromPath(path)).toBe(lang));

  it("maps direction", () => {
    expect(dirFor("ar")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
  });
});
