import express, { NextFunction, Request, Response } from "express"
import mongoose, { Collection, Schema } from "mongoose"

const app = express()
const PORT = 3000
const jwt = require("jsonwebtoken")

require("dotenv").config()

app.use(express.json())

mongoose.connect(
  "mongodb+srv://aranovic596:fiWuYXh7m145TJZE@cluster0.qwuxdc2.mongodb.net/TastyDB"
)

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
})

const UserModel = mongoose.model("Users", UserSchema)

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, welcome to your Express API!")
})

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body

  UserModel.findOne({ username: username }).then((user) => {
    if (user) {
      if (user.password == password) {
        const token = jwt.sign({ username: username }, "SECRET")
        console.log("Genererad token:", token)
        res.json({ token: token })
      } else {
        res.json("incorrect password")
      }
    } else {
      res.json("No record existed")
    }
  })
})

app.delete("/deleteUser/:username", async (req: Request, res: Response) => {
  const { username } = req.params
  try {
    const user = await UserModel.findOne({ username })
    if (user) {
      await UserModel.deleteOne({ username })
      res.json({ message: "User has been deleted", username })
    } else {
      res.status(404).json({ message: "Could not find user" })
    }
  } catch (error) {
    console.error("Something wrong happend while trying to delete user:", error)
    res
      .status(500)
      .json({ message: "Something wrong happend while trying to delete user" })
  }
})

app.post("/createUser", async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    const existingUser = await UserModel.findOne({ username })

    if (existingUser) {
      return res.status(400).json({ message: "Användarnamnet finns redan" })
    }

    const newUser = new UserModel({ username, password })
    await newUser.save()

    res.status(201).json({ message: "User has successfuly been created" })
  } catch (error) {
    console.error("Fel vid skapande av användare:", error)
    res
      .status(500)
      .json({ message: "Ett fel inträffade vid skapande av användare" })
  }
})

app.get("/getAllUsers", async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({})
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/updateUser/:username", async (req: Request, res: Response) => {
  const { username } = req.params
  const { newPassword } = req.body

  try {
    const user = await UserModel.findOne({ username })

    if (!user) {
      return res.status(404).json({ message: "Could not find user" })
    }

    console.log("New password received:", newPassword)
    user.password = newPassword
    await user.save()

    res.json({ message: "User password has been updated", newPassword })
  } catch (error) {
    console.error(
      "Something wrong happened while trying to update user:",
      error
    )
    res
      .status(500)
      .json({ message: "Something wrong happened while trying to update user" })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on
http://localhost:${PORT}`)
})
