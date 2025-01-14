const sharp = require("sharp")
const { createCanvas } = require("canvas")

const colors = {
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  orange: { r: 255, g: 165, b: 0 },
  purple: { r: 128, g: 0, b: 128 },
  pink: { r: 255, g: 192, b: 203 },
  brown: { r: 165, g: 42, b: 42 },
  gray: { r: 128, g: 128, b: 128 },
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  lightBlue: { r: 173, g: 216, b: 230 },
  darkBlue: { r: 0, g: 0, b: 139 },
  lightGreen: { r: 144, g: 238, b: 144 },
  darkGreen: { r: 0, g: 100, b: 0 },
  lightYellow: { r: 255, g: 255, b: 224 },
  darkRed: { r: 139, g: 0, b: 0 },
  // Your custom colors
  dragonPurple: { r: 92, g: 45, b: 145 },       // #5C2D91
  lightDragonPink: { r: 224, g: 63, b: 142 },   // #E03F8E
  dragonPink: { r: 218, g: 37, b: 125 },        // #DA257D
  dragonBlue: { r: 59, g: 95, b: 206 },         // #3B5FCE
  dragonCyan: { r: 49, g: 216, b: 242 }        // #31D8F2
}
const addTextToCanvas = ({
  ctx,
  text,
  x = 0,
  y = 0,
  lineHeight = 20,
  oneWordPerLine = true,
  padding = 0
}) => {
  const words = oneWordPerLine ? text.split(" ") : [text] // Split text into words if oneWordPerLine is true
  const textAreaHeight = ctx.canvas.height - 2 * padding // Account for padding
  const calculatedLineHeight = lineHeight || textAreaHeight / words.length

  words.forEach((word, index) => {
    const wordX = x // X position for the text
    const wordY = padding + ((index + 0.5) * calculatedLineHeight) + y // Y position for the text
    ctx.strokeText(word, wordX, wordY)
    ctx.fillText(word, wordX, wordY)
  })
}

// Main function to create pixel art
const createPixelArt = async (inputPath, outputPath) => {
  const inputImage = sharp(inputPath)


  const metadata = await inputImage.metadata()

  const { width, height } = metadata
  const downscaleWidth = Math.max(Math.round(width / 8), 1)
  const downscaleHeight = Math.max(Math.round(height / 8), 1)

  const pixelatedBuffer = await inputImage
    .modulate({
      brightness: 1.1 // Step 1: Increase brightness
    })
    .linear(1, 30) // Step 2: Raise all pixel values by 30
    .tint(colors.magenta)
    .resize(downscaleWidth, downscaleHeight, { kernel: sharp.kernel.nearest })
    .toBuffer()
    .then(data =>
      sharp(data)
        .resize(width, height, { kernel: sharp.kernel.nearest })
        .blur(0.5)
        .resize(696, 391)
        .toBuffer()
    )

  const canvasWidth = 696
  const canvasHeight = 391
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  // Text properties
  ctx.fillStyle = "white"
  ctx.strokeStyle = "black"
  ctx.lineWidth = Math.round(canvasHeight / 100)
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.font = `bold ${Math.round(canvasHeight / 8)}px Arial`

  // Add text to canvas using the utility function
  addTextToCanvas({
    ctx,
    text: "KNOW YOUR PLACE TRASH",
    x: (canvasWidth / 3) * 2,
    y: 25,
    lineHeight: 75,
    padding: canvasHeight * 0.1,
    oneWordPerLine: true
  })

  const textBuffer = canvas.toBuffer()

  await sharp(pixelatedBuffer)
    .composite([{ input: textBuffer }])
    .webp({ quality: 90 })
    .toFile(outputPath)

  const outputMetadata = await sharp(outputPath).metadata()
  console.log("Output Image Metadata:", outputMetadata)

  console.log(`Pixelated image with outlined text and margin saved to ${outputPath}`)
}

createPixelArt("scripts/img.png", "scripts/thumb-know-your-place.webp")
