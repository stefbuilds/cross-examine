import { describe, expect, it } from "vitest";

import { trials } from "./trials-data";

describe("documented trials fixture", () => {
  it("preserves every documented trial and the RISKY limitations", () => {
    expect(trials.map((trial) => trial.repository)).toEqual([
      "python-slugify",
      "humanize",
      "validators",
    ]);
    expect(
      trials.filter((trial) => trial.layerAB.verdict === "RISKY"),
    ).toHaveLength(2);
    expect(
      trials.find((trial) => trial.repository === "humanize")?.limitation,
    ).toContain("freezegun");
  });
});
