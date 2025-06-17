import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Files array is required" },
        { status: 400 }
      );
    }

    const processedFiles = [];

    for (const file of files) {
      try {
        console.log("Processing file:", file.name);

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file.uploadcareUrl, {
          public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
          use_filename: false,
          unique_filename: true,
        });

        if (cloudinaryResult.success) {
          const processedFile = {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadcareUrl: file.uploadcareUrl,
            cloudinaryUrl: cloudinaryResult.data.url,
            cloudinaryPublicId: cloudinaryResult.data.public_id,
            isImage:
              file.isImage || cloudinaryResult.data.resource_type === "image",
            dimensions:
              cloudinaryResult.data.width && cloudinaryResult.data.height
                ? {
                    width: cloudinaryResult.data.width,
                    height: cloudinaryResult.data.height,
                  }
                : null,
          };

          processedFiles.push(processedFile);
        } else {
          console.error(
            "Failed to upload to Cloudinary:",
            cloudinaryResult.error
          );
          // Fallback to Uploadcare URL if Cloudinary fails
          processedFiles.push({
            ...file,
            cloudinaryUrl: file.uploadcareUrl,
            cloudinaryPublicId: null,
          });
        }
      } catch (error) {
        console.error("Error processing file:", error);
        // Include file with error but continue processing others
        processedFiles.push({
          ...file,
          cloudinaryUrl: file.uploadcareUrl,
          cloudinaryPublicId: null,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: processedFiles,
    });
  } catch (error) {
    console.error("File processing API error:", error);
    return NextResponse.json(
      { error: "Failed to process files" },
      { status: 500 }
    );
  }
}
