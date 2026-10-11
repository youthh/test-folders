import { buildICS } from "./ics";

const plan = {
  day: "2026-10-15",
  time: "19:30",
  ideas: [],
  note: "Дуже довге побажання з комою, крапкою з комою; і емодзі 💌 ".repeat(4) + "\r\nдругий рядок",
};

describe("buildICS", () => {
  const ics = buildICS(plan);
  const lines = ics.split("\r\n");

  it("ends with CRLF and has no stray line breaks inside lines", () => {
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(lines.some((l) => /[\r\n]/.test(l))).toBe(false);
  });

  it("folds every line to at most 75 UTF-8 octets", () => {
    const longest = Math.max(...lines.map((l) => Buffer.byteLength(l, "utf8")));
    expect(longest).toBeLessThanOrEqual(75);
  });

  it("uses a UTC DTSTAMP and a TZID for the event times", () => {
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
    expect(ics).toMatch(/DTSTART;TZID=Europe\/Kyiv:20261015T193000/);
  });

  it("generates a different UID for every invite", () => {
    const uid = (s: string) => (s.match(/UID:(.*)/) || [])[1];
    expect(uid(buildICS(plan))).not.toBe(uid(buildICS(plan)));
  });
});
