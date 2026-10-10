import { buildTelegramShareUrl, buildWhatsAppShareUrl } from "./shareLinks";

describe("share links", () => {
  it("encodes the text for Telegram and keeps the url", () => {
    const link = buildTelegramShareUrl("Побачення & кава\nо 19:00", "https://x.y/a?b=1");
    const params = new URL(link).searchParams;
    expect(new URL(link).origin + new URL(link).pathname).toBe("https://t.me/share/url");
    expect(params.get("url")).toBe("https://x.y/a?b=1");
    expect(params.get("text")).toBe("Побачення & кава\nо 19:00");
  });

  it("encodes the text for WhatsApp", () => {
    const link = buildWhatsAppShareUrl("кава? так & ні");
    expect(link.startsWith("https://wa.me/?text=")).toBe(true);
    expect(new URL(link).searchParams.get("text")).toBe("кава? так & ні");
  });
});
