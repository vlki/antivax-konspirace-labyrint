const sharp = require("sharp");
const path = require("path");

const inputPath = path.join(__dirname, "/public/antivax-konspirace-sit.png");
const outputPath = path.join(
  __dirname,
  "/public/build/antivax-konspirace-sit.dz"
);

sharp(inputPath)
  .png()
  .tile({
    size: 512,
  })
  .toFile(outputPath, function (err, info) {
    // output.dzi is the Deep Zoom XML definition
    // output_files contains 512x512 tiles grouped by zoom level
  });
