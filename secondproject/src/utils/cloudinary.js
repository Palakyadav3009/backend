import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
};

//public_id: A string representing the unique identifier of the file to be deleted from Cloudinary.
//resource_type: An optional string specifying the type of resource, defaulting to "image".
const deleteFromCloudinary = async (public_id, resource_type = "image") => {
    try {
       if (!public_id) return null;
 
       const response = await cloudinary.uploader.destroy(public_id, {
          resource_type: `${resource_type}`,
       });
 
       console.log("file deleted from Cloudinary");
       return response;
    } catch (error) {
       console.log("Failed while deleting the file from Cloudinary", error);
    }
 };



export {uploadCloudinary,deleteFromCloudinary}

    // cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    //   { public_id: "olympic_flag" }, 
    //   function(error, result) {console.log(result); });