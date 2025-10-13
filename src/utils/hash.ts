import bcrypt from 'bcrypt';

const hashingPassword = async (password: string) => {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("해싱 중 오류 발생:", error.message);
    } else {
      console.log("해싱 중 알 수 없는 오류 발생:", error);
    }
    throw error;
  }
}

const verifyPassword = async (inputPassword: string, password: string) => {
  try {
    const isMatch = await bcrypt.compare(inputPassword, password);
    return isMatch
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("비밀번호 비교 중 오류 발생:", error.message);
    } else {
      console.log("비밀번호 비교 중 알 수 없는 오류 발생:", error);
    }
    throw error
  }
}

export default {
  hashingPassword,
  verifyPassword,
}