import sharp from "sharp";

const TARGET_SIZE = 1200;

export async function upscaleImage(input: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  const metadata = await sharp(input).metadata();
  const longestSide = Math.max(metadata.width || 0, metadata.height || 0);

  const format = metadata.format || "jpeg";
  const ext = format === "jpeg" ? "jpg" : format;

  if (longestSide >= TARGET_SIZE) {
    return { buffer: input, ext };
  }

  const ratio = TARGET_SIZE / longestSide;
  const newWidth = Math.round((metadata.width || 0) * ratio);
  const newHeight = Math.round((metadata.height || 0) * ratio);

  const pipeline = sharp(input).resize(newWidth, newHeight, {
    kernel: "lanczos3",
    withoutEnlargement: false,
  });

  if (format === "jpeg") {
    pipeline.jpeg({ quality: 92, mozjpeg: true });
  } else if (format === "png") {
    pipeline.png({ quality: 92, palette: true });
  } else if (format === "webp") {
    pipeline.webp({ quality: 92 });
  }

  const buffer = await pipeline.toBuffer();
  return { buffer, ext };
}
