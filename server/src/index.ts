import "dotenv/config"
import "reflect-metadata";
import express from 'express'
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";
import cors from "cors";

(async () => {
    const app = express()
    app.use(cookieParser())
    app.use(cors({
        credentials: true,
        origin: "http://localhost:3000"
    }))

    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid

        if (!token) {
            return res.json({
                ok: false,
                accessToken: ''
            })
        }
        let payload: any = null
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch (error) {
            console.log(error)
            res.json({
                ok: false,
                accessToken: ''
            })

        }
        const user = await User.findOne({
            id: payload.userId
        })
        if (!user) {
            return res.json({
                ok: false,
                accessToken: ''
            })
        }

        if(user.tokenVersion !== payload.tokenVersion){
            return res.json({
                ok: false,
                accessToken: ''
            })
        }

        sendRefreshToken(res, createRefreshToken(user))

        return res.json({
            ok: true,
            accessToken: createAccessToken(user)
        })
    })

    console.log('Connecting to Db')
    await createConnection()
    console.log('Connected to Db')

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    })

    apolloServer.applyMiddleware({ app, cors: false })
    app.listen(4000, () => {
        console.log('Graphql Server is UP!')
    })
})()

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
