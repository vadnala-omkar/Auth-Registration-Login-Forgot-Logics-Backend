import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import User from './models/user.js'
dotenv.config()

const app = express();
const PORT =  process.env.PORT || 5000;

app.use(cors({origin:'*'}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res)=>{
    console.log("Server started")
    res.status(200).json({message:"this is default route"})
})

mongoose.connect(process.env.MONGO_URI)
.then(()=>{console.log("connected to mongodb")})
.catch((err)=>{console.log("error connecting to DB", err)})


app.post('/register-newuser', async(req, res)=>{
    console.log('line 28', req.body)
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
        username,
        email,
        password:hashedPassword
    })
    await newUser.save()
    res.status(201).json({message:"User saved manually"})
    console.log('User Successfully registered',hashedPassword)
})

app.post('/user-login', async(req, res)=>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            console.log("User not found")
            return res.status(400).json({message:'user not found'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            console.log('Invalid Password')
            res.status(400).json({message:'Invalid email or Password '})
        }
        console.log('user logged in sucessfully')
        res.status(200).json({message:'User logged in sucessfully'})
    }catch(err){
        console.log('Error While login', err)
        res.status(500).json({message:'Error While login'})
    }
    
})

// app.post('/login', async(req, res)=>{
//     const {username, password}= req.body;
//     try{
//         const user = await User.findOne({username});
//         if(!user){
//             console.log('user not found');
//             return res.status(400).json({message: 'Invalid username or password'});
//         }
//         const ismatch = await bcrypt.compare(password, user.password);
//         if(!ismatch){
//             console.log('Invalid password');
//             return res.status(400).json({messsage: 'Invalid username or password'});
//         }
//         console.log('User logged in successfully');
//         res.status(200).json({message: 'User logged in successfully'});
//     }catch(err){
//         console.log('Error logging in user:', err);
//         res.status(500).json({message: 'Error logging in user', error: err});
//     }
// })





app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})