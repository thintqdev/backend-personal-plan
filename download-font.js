const https = require("https");
const fs = require("fs");
const path = require("path");

// Tạo thư mục fonts nếu chưa có
const fontsDir = path.join(__dirname, "src", "fonts");
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Download DejaVu Sans font (hỗ trợ Unicode/Vietnamese)
const fontUrl =
  "https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.zip";
const fontPath = path.join(fontsDir, "dejavu-fonts.zip");

console.log("Downloading DejaVu fonts...");

const file = fs.createWriteStream(fontPath);
https
  .get(fontUrl, (response) => {
    response.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log("Font downloaded successfully to:", fontPath);
      console.log(
        "Extract the TTF files from the zip and place them in src/fonts/"
      );
    });
  })
  .on("error", (err) => {
    fs.unlink(fontPath, () => {}); // Delete the file async
    console.error("Error downloading font:", err.message);
  });
