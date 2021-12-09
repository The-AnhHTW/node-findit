import bcrypt from 'bcryptjs';


export async function hashPassword(clearTextPw: string) {
    return bcrypt.hash(clearTextPw, 8);
}

export async function comparePassword(pw: string, hashedPW: string) {
    return bcrypt.compare(pw, hashedPW);
}