const cloudinary = require('cloudinary').v2;

async function run() {
  try {
    // 2. Upload an image
    console.log("Uploading image...");
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg', 
      { public_id: 'sample_upload_test' }
    );
    console.log("Upload secure URL:", uploadResult.secure_url);
    console.log("Upload public ID:", uploadResult.public_id);

    // 3. Get image details
    console.log("\nFetching image details...");
    // We use the Admin API to get the resource details
    const details = await cloudinary.api.resource(uploadResult.public_id);
    console.log(`Image Details:
- Width: ${details.width}px
- Height: ${details.height}px
- Format: ${details.format}
- File Size: ${details.bytes} bytes`);

    // 4. Transform the image
    // f_auto (fetch_format: 'auto'): Automatically selects the most efficient image format based on the browser.
    // q_auto (quality: 'auto'): Automatically optimizes the image quality to reduce file size without visible degradation.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformedUrl);

  } catch (error) {
    console.error("Error:", error);
  }
}

run();
