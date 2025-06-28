/**
 * 生成随机验证码
 */
export const generateCaptcha = (): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars.charAt(idx);
  }
  return result;
}

/**
 * 在Canvas上绘制验证码
 */
export const drawCaptcha = (canvas: HTMLCanvasElement, text: string): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 设置渐变背景
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(70, 130, 180, 0.2)');
  gradient.addColorStop(1, 'rgba(95, 158, 160, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制干扰线
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, 0.3)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  // 绘制验证码文字
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4682b4';
  ctx.font = 'bold 24px Arial';

  for (let i = 0; i < text.length; i++) {
    const x = 30 + i * 25;
    const y = canvas.height / 2 + Math.random() * 6 - 3;
    const rotate = (Math.random() - 0.5) * 0.3;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
} 