const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/`~]).{8,}$/;
const NICKNAME_REGEX = /^.{2,10}$/;

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: '아이디는 영문+숫자 조합 4~20자여야 합니다.' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!PASSWORD_REGEX.test(password)) {
    return { valid: false, error: '비밀번호는 영문+숫자+특수문자 포함 8자 이상이어야 합니다.' };
  }
  return { valid: true };
}

export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!NICKNAME_REGEX.test(nickname)) {
    return { valid: false, error: '닉네임은 2~10자여야 합니다.' };
  }
  return { valid: true };
}
