import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { buildSafeFilename, validateImageFile } from "../src/utils/upload";

describe("📸 UPLOAD DE IMAGENS", () => {
  it("✅ deve gerar nome seguro sem colidir com arquivos existentes", () => {
    const testDir = path.join(process.cwd(), "tmp-upload-tests");
    fs.mkdirSync(testDir, { recursive: true });
    const firstPath = path.join(testDir, "poster.jpg");
    fs.writeFileSync(firstPath, "test");

    expect(buildSafeFilename("poster.jpg", testDir)).toBe("poster-1.jpg");

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("❌ deve rejeitar extensão inválida", () => {
    const error = validateImageFile({
      originalname: "arquivo.txt",
      mimetype: "text/plain",
      size: 100,
    } as any);

    expect(error).toBeTruthy();
    expect(error?.message).toContain("JPG");
  });

  it("❌ deve rejeitar arquivo acima do tamanho máximo", () => {
    const error = validateImageFile({
      originalname: "poster.png",
      mimetype: "image/png",
      size: 3 * 1024 * 1024,
    } as any);

    expect(error).toBeTruthy();
    expect(error?.message).toContain("2MB");
  });
});
