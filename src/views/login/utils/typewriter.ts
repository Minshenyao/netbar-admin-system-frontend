/**
 * 打字机效果类
 */
export class Typewriter {
  private element: Element | null;
  private text: string;
  private speed: number;
  private currentIndex: number;
  private timerId: number | null;

  /**
   * 构造函数
   * @param selector 元素选择器
   * @param text 要打印的文本
   * @param speed 打字速度(毫秒)
   */
  constructor(selector: string, text: string, speed: number = 150) {
    this.element = document.querySelector(selector);
    this.text = text;
    this.speed = speed;
    this.currentIndex = 0;
    this.timerId = null;
  }

  /**
   * 开始打字效果
   */
  start(): void {
    if (!this.element) return;
    
    this.element.textContent = '';
    this.currentIndex = 0;
    
    this.type();
  }

  /**
   * 停止打字效果
   */
  stop(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 打字函数
   */
  private type(): void {
    if (!this.element) return;
    
    if (this.currentIndex < this.text.length) {
      this.element.textContent += this.text.charAt(this.currentIndex);
      this.currentIndex++;
      
      // 根据不同字符调整速度，模拟真实打字效果
      const randomSpeed = this.speed + Math.random() * 100 - 50;
      
      this.timerId = window.setTimeout(() => this.type(), randomSpeed);
    }
  }
} 