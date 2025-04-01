import express from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudnary.js';

export const login = async (req,res) => {
    const {email, password} = req.body;
    
    try {
        if(!email || !password)
        {
            return res.status(400).json({message: "All fields are required"});
        }
        
        const existUser = await User.findOne({email: email});
        if(!existUser)
        {
            return res.status(400).json({message: "Invalid Credential"});
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, existUser.password);
        if(!isPasswordCorrect)
        {
            return res.status(400).json({message: "Invalid Credential"});
        }
        
        generateToken(existUser._id,res)
        
        return res.status(200).json({
            message: "User log-in Successfully",
            _id: existUser._id,
            fullName: existUser.fullName.firstName + " " + existUser.fullName.lastName,
            email: existUser.email,
            profilePic: existUser.profilePic,
        })
    } catch (error) {
        console.log("Something went wrong in the User Controller:",error.message);
        return res.status(500).json({message: "Internal server Error"});
    }
    
}

export const userProfile = async (req,res) =>{
   
    const {email} = req.body;
    try {
        const userExist = await User.findOne({email});
        if(!userExist){
            return res.status(404).json({message: "User not found"})
        }
        

        return res.status(200).json({
            _id: userExist._id,
            fullName: userExist.fullName.firstName + " " + userExist.fullName.lastName,
            profilePic: userExist.profilePic,
        })
    } catch (error) {
        console.log("Something went wrong in the User Controller:",error.message);
        return res.status(500).json({message: "Internal server Error"});
    }
}
export const updateProfile = async (req,res) =>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic)
        {
            return res.status(400).json({message: "No profile pic provided!!!"});
        }
    const uploadResponse = await cloudinary.uploader.upload(profilePic,{
        public_id: 'profilePic',
    })
    const updateUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url},{new:true});

    return res.status(200).json({updateUser,message: "Profile Updated Successfully!!!"})
    } catch ({error}) {
        console.log("Something went wrong in the User Controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if(!fullName || !email || !password)
        {
            return res.status(400).json({message: "All fields are required!!!"});
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        console.log(req.body);
        
        // Corrected this line to properly search by email
        const user = await User.findOne({ email: email });
        console.log("3");  // Now this will be logged if the findOne query succeeds

        if (user) {
            return res.status(400).json({ message: `${email} already exists` });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);  // Added await to the hash function

        const newUser = new User({
            fullName: {
                firstName: fullName.firstName,
                lastName: fullName.lastName,
            },
            email,
            password: hashedPassword,
        });
        
        if (newUser) {
            await newUser.save();
            generateToken(newUser._id, res);
        
            return res.status(201).json({
                message: "User created in the database",
                _id: newUser._id,
                fullName: newUser.fullName.firstName + " " + newUser.fullName.lastName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Something went wrong in the User Controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const logout = (req,res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message: "Logged Out Successfully"})
    } catch (error) {
        console.log("Something went wrong in the User Controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req,res) => {
    try {
        return res.status(200).json(req.user);

    } catch (error) {
        console.log("Something went wrong in the CheckAuth Controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}