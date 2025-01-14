const sharp = require('sharp');
const { createCanvas } = require('canvas');

const createPixelArt = async (inputPath, outputPath) => {
  const inputImage = sharp(inputPath);


  const metadata = await inputImage.metadata();

  const { width, height } = metadata;
  const downscaleWidth = Math.max(Math.round(width / 8), 1);
  const downscaleHeight = Math.max(Math.round(height / 8), 1);


  const pixelatedBuffer = await inputImage
    .tint({ r: 255, g: 0, b: 255 })
    .resize(downscaleWidth, downscaleHeight, {
      kernel: sharp.kernel.nearest,
    })
    .toBuffer()
    .then(data => sharp(data)
      .resize(width, height, {
        kernel: sharp.kernel.nearest,
      })
      .blur(0.5)
      .toBuffer());


  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const text = "Am_I out_of touch?";
  const words = text.split(' ');

  const padding = height * 0.1;
  const textAreaHeight = height - (2 * padding);
  const lineHeight = textAreaHeight / words.length;

  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = Math.round(textAreaHeight / 100);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(height / 8)}px Arial`;



  words.forEach((word, index) => {
    // const x = ((2 / 3) * width) - 15;
    const x =  100;
    const y = padding + ((index + 0.5) * lineHeight);

    ctx.strokeText(word, x, y);

    ctx.fillText(word, x, y);
  });

  const textBuffer = canvas.toBuffer();

  await sharp(pixelatedBuffer)
    .composite([{ input: textBuffer }])
    .webp({ quality: 90 })
    .toFile(outputPath);

  const outputMetadata = await sharp(outputPath).metadata();
  console.log('Output Image Metadata:', outputMetadata);

  console.log(`Pixelated image with outlined text and margin saved to ${outputPath}`);
};

createPixelArt('scripts/img.png', 'scripts/am-i-out-of-touch.webp');
