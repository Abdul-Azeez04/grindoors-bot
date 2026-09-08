import svgCaptcha from 'svg-captcha';

interface CaptchaData {
  text: string;
  attempts: number;
  expiresAt: number;
}

export class CaptchaService {
  private pendingCaptchas = new Map<string, CaptchaData>();

  generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = (num1 + num2).toString();
    
    return {
      text: answer,
      question: `What is **${num1} + ${num2}**?`
    };
  }

  setCaptcha(guildId: string, userId: string, text: string) {
    const key = `${guildId}-${userId}`;
    this.pendingCaptchas.set(key, {
      text: text.toLowerCase(),
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000
    });
  }

  getCaptcha(guildId: string, userId: string) {
    return this.pendingCaptchas.get(`${guildId}-${userId}`);
  }

  verifyCaptcha(guildId: string, userId: string, answer: string): { success: boolean, message: string, attemptsLeft?: number } {
    const key = `${guildId}-${userId}`;
    const captcha = this.pendingCaptchas.get(key);

    if (!captcha) {
      return { success: false, message: 'No pending CAPTCHA found or it has expired.' };
    }

    if (Date.now() > captcha.expiresAt) {
      this.pendingCaptchas.delete(key);
      return { success: false, message: 'CAPTCHA has expired. Please start verification again.' };
    }

    captcha.attempts += 1;

    if (answer.toLowerCase() === captcha.text) {
      this.pendingCaptchas.delete(key);
      return { success: true, message: 'CAPTCHA verified successfully.' };
    }

    if (captcha.attempts >= 3) {
      this.pendingCaptchas.delete(key);
      return { success: false, message: 'Verification failed. Max attempts reached. Please try again later.', attemptsLeft: 0 };
    }

    return { success: false, message: `Wrong answer. ${3 - captcha.attempts} attempts remaining.`, attemptsLeft: 3 - captcha.attempts };
  }
}

export const captchaService = new CaptchaService();
