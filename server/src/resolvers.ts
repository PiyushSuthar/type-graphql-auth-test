import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql'
import { hash, compare } from 'bcrypt'
import { User } from './entity/User'
import { MyContext } from './myContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
    @Field(()=> User)
    user: User
}
@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return "Hi!"
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() { payload }: MyContext
    ) {
        return "You user id is " + payload?.userId
    }

    @Query(() => [User])
    Users() {
        return User.find()
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() context: MyContext
    ) {
        const authorization = context.req.headers['authorization']

        if (!authorization) {
            return null
        }

        try {
            const token = authorization?.split(' ')[1]
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)

            return await User.findOne(payload.userId)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    @Mutation(() => Boolean)
    async logout(
        @Ctx() {res}: MyContext
    ) {
        sendRefreshToken(res, "")
        return true
    }
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg("userId", () => Int) userId: number
    ) {
        await getConnection()
            .getRepository(User)
            .increment({ id: userId }, "tokenVersion", 1)
        return true
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({
            where: { email }
        })

        if (!user) {
            throw new Error("Could Not Find user!");
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error("Bad Password");
        }

        // Login succesful

        sendRefreshToken(res, createRefreshToken(user))

        return {
            accessToken: createAccessToken(user),
            user
        }

    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {
        try {

            const hashedPassword = await hash(password, 12)
            await User.insert({
                email,
                password: hashedPassword
            })
            return true

        } catch (error) {
            console.log(error)
            return false
        }
    }
}