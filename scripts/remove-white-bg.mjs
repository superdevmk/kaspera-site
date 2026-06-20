import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, "..", "assets", "images");

async function removeWhiteBackground(inputPath, outputPath, threshold = 248) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness >= threshold) {
      data[i + 3] = 0;
    } else if (brightness >= threshold - 25) {
      const fade = (threshold - brightness) / 25;
      data[i + 3] = Math.round(data[i + 3] * fade);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Created ${outputPath}`);
}

await removeWhiteBackground(
  join(imagesDir, "kaspera-wordmark-src.png"),
  join(imagesDir, "kaspera-wordmark.png"),
  248
);

await removeWhiteBackground(
  join(__dirname, "..", "KASPERA LOGO.jpg"),
  join(imagesDir, "kaspera-full.png"),
  242
);

await removeWhiteBackground(
  join(imagesDir, "darko-mickoski-src.png"),
  join(imagesDir, "darko-mickoski.png"),
  245
);
