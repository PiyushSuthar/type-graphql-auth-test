import { verify, VerifyErrors } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql"
import { MyContext } from "./myContext"

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {

    const authorization = context.req.headers['authorization']

    if (!authorization) {
        throw new Error("Not Authenticated");
    }

    try {
        const token = authorization?.split(' ')[1]
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!)

        context.payload = payload as any

    } catch (error) {
        // console.log(error)
        let err: VerifyErrors = error
        throw new Error(err ? err.message : "Token Invalid")
    }

    return next()
}