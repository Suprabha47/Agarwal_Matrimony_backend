function buildImageUrl(req, imagePath) {
  if (!imagePath || imagePath === "default-profile.jpg")
    return "default-profile.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return imagePath;
}

function handleProfilePhoto(req, candidateData, existingCandidate = null) {
  // Handle profile photo upload
  if (req.files?.profilePhoto && req.files.profilePhoto[0]) {
    candidateData.image_path = req.files.profilePhoto[0].filename;
  } else if (req.files?.image_path && req.files.image_path[0]) {
    candidateData.image_path = req.files.image_path[0].filename;
  } else if (existingCandidate?.image_path) {
    // Keep existing filename if no new upload\
    candidateData.image_path = existingCandidate.image_path;
  } else {
    // Default photo if none exists
    candidateData.image_path = "default-profile.jpg";
  }

  // Optional: handle additional photos
  if (req.files?.additionalPhotos) {
    candidateData.additional_photos = req.files.additionalPhotos.map(
      (file) => file.filename
    );
  }

  return candidateData;
}

module.exports = { buildImageUrl, handleProfilePhoto };
