const express = require("express")
const router = express.Router();
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");

router.get("/getUsers", async (req, res) => {
    try {
        const topUsers = await User.find().sort({ points: -1 }).limit(5);

        console.log({topUsers})
        // Return the users in the response
        res.status(200).json(topUsers);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/points", async (req, res) => {

    const { userId, points } = req.body;

    console.log(req.body)

    if (!userId || !points) {
        return res.status(400).json({ message: "Userid and points are required!" })
    }

    try {

        console.log("Hello")

        const existingUser = await User.findOne({userId});

        console.log({existingUser})

        if (!existingUser) {
            return res.status(404).json({message: "User with this id does not exist!"})
        }

        existingUser.points = points;
        await existingUser.save();

        res.status(200).json({ message: "Points updated successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }

});

router.post("/register", async (req, res) => {


    try {

        const { username, password } = req.body;
        console.log(req.body)
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password is required!" });
        }

        const isUserExist = await User.findOne({ userName:username });

        console.log({isUserExist})

        if (isUserExist) {
            if (isUserExist.password !== password) {
                return res.status(400).json({message:"Incorrect Password!"})
            } else if (isUserExist.password === password && isUserExist.firstTimeLogging===false) {
                return res.status(200).json({message: "User authenticated.", userId:isUserExist.userId})
            }
            // return res.status(400).json({ message: "User with this name already exist!" });
        } else {
            const newUser = new User({
                userName:username,
                userId: uuidv4(),
                password,
                firstTimeLogging: false
            });
            await newUser.save();
    
            res.status(201).json({
                message: "User registered successfully",
                userId: newUser.userId,
            }); 
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
});

module.exports = router;