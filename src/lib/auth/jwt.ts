import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-change-me'
const key = new TextEncoder().encode(secretKey)

export async function signJwt(payload: { clientId: string }, expiresIn: string = '7d') {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(key)
}

export async function verifyJwt(token: string) {
    try {
        const { payload } = await jwtVerify(token, key)
        return payload as { clientId: string }
    } catch (error) {
        return null
    }
}
