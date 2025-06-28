import type { FormRules } from 'element-plus'

/**
 * 获取登录表单验证规则
 */
export const getLoginRules = (captchaText: string): FormRules => {
  return {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { min: 3, max: 20, message: '账号长度应为3-20个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
    ],
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { 
        validator: (rule, value, callback) => {
          if (value === '') {
            callback(new Error('请输入验证码'));
          } else if (value.toLowerCase() !== captchaText.toLowerCase()) {
            callback(new Error('验证码错误'));
          } else {
            callback();
          }
        }, 
        trigger: 'blur' 
      }
    ]
  }
}

/**
 * 获取注册表单验证规则
 */
export const getRegisterRules = (
  registerForm: { password: string; confirmPassword: string }, 
  captchaText: string
): FormRules => {
  return {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { min: 3, max: 20, message: '账号长度应为3-20个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' },
      { 
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 
        message: '密码必须包含大小写字母和数字', 
        trigger: 'blur' 
      }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      { 
        validator: (rule, value, callback) => {
          if (value === '') {
            callback(new Error('请再次输入密码'));
          } else if (value !== registerForm.password) {
            callback(new Error('两次输入密码不一致'));
          } else {
            callback();
          }
        }, 
        trigger: 'blur' 
      }
    ],
    identity: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      { 
        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, 
        message: '请输入正确的身份证号码', 
        trigger: 'blur' 
      }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { 
        pattern: /^1[3-9]\d{9}$/, 
        message: '请输入正确的手机号码', 
        trigger: 'blur' 
      }
    ],
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { 
        validator: (rule, value, callback) => {
          if (value === '') {
            callback(new Error('请输入验证码'));
          } else if (value.toLowerCase() !== captchaText.toLowerCase()) {
            callback(new Error('验证码错误'));
          } else {
            callback();
          }
        }, 
        trigger: 'blur' 
      }
    ]
  }
} 