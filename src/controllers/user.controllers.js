import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  
    //get user details from front end
    // validation- not empty
    // check if user alredy exists : username, email
    // check for images, avatar
    // upload them to cloudinary, avatar img
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, email, userName, password} = req.body
    // console.log("email:", email);

    if (
        [fullName, email, userName, password].some((field)=>field?.trim() === "")
    ){
        throw new apiError(400, "All fields are required")
    }



    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if ( existedUser ) {
        throw new apiError(409, " User Name and Email already exists ");
        
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar image requieard")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new apiError(409, " User Name and Email already exists ");
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new apiError(500, "Somthing went wrong while registering user")
    }
 
    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully ")
    )
})

export {registerUser}
