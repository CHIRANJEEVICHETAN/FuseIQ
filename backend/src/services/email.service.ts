import nodemailer from "nodemailer";
import { config } from "../config/environment";

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in development
      },
    });
  }
  return transporter;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: "Password Reset Request - EvolveSync",
    html: getPasswordResetEmailTemplate(userName, resetUrl, resetToken),
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  temporaryPassword?: string
): Promise<void> {
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: "Welcome to EvolveSync",
    html: getWelcomeEmailTemplate(userName, temporaryPassword),
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}

/**
 * Send password change confirmation email
 */
export async function sendPasswordChangeConfirmation(
  email: string,
  userName: string
): Promise<void> {
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: "Password Changed Successfully - EvolveSync",
    html: getPasswordChangeConfirmationTemplate(userName),
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Password change confirmation sent to: ${email}`);
  } catch (error) {
    console.error("Failed to send password change confirmation:", error);
    // Don't throw error for confirmation emails
  }
}

/**
 * Test email configuration
 */
export async function testConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("Email service connection verified successfully");
    return true;
  } catch (error) {
    console.error("Email service connection failed:", error);
    return false;
  }
}

/**
 * Password reset email template
 */
function getPasswordResetEmailTemplate(
  userName: string,
  resetUrl: string,
  resetToken: string
): string {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background-color: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EvolveSync</h1>
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your EvolveSync account. If you made this request, please click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            
            <p>For security reasons, this reset token is: <code>${resetToken.substring(
              0,
              8
            )}...</code></p>
          </div>
          <div class="footer">
            <p>This email was sent from EvolveSync. If you have any questions, please contact your system administrator.</p>
            <p>&copy; ${new Date().getFullYear()} EvolveSync. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}

/**
 * Welcome email template
 */
function getWelcomeEmailTemplate(
  userName: string,
  temporaryPassword?: string
): string {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EvolveSync</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .credentials { background-color: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EvolveSync!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Welcome to EvolveSync! Your account has been successfully created and you can now access the employee management system.</p>
            
            ${
              temporaryPassword
                ? `
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
              <p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
            </div>
            `
                : ""
            }
            
            <div style="text-align: center;">
              <a href="${
                config.frontendUrl
              }/login" class="button">Login to EvolveSync</a>
            </div>
            
            <h3>What you can do with EvolveSync:</h3>
            <ul>
              <li>Track your time and attendance</li>
              <li>Manage your tasks and projects</li>
              <li>Submit leave requests</li>
              <li>Manage expense reports</li>
              <li>View your dashboard and reports</li>
            </ul>
            
            <p>If you have any questions or need help getting started, please contact your system administrator.</p>
          </div>
          <div class="footer">
            <p>This email was sent from EvolveSync. If you have any questions, please contact your system administrator.</p>
            <p>&copy; ${new Date().getFullYear()} EvolveSync. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}

/**
 * Password change confirmation template
 */
function getPasswordChangeConfirmationTemplate(userName: string): string {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .security-notice { background-color: #fef3cd; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EvolveSync</h1>
            <h2>Password Changed Successfully</h2>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>This email confirms that your password has been successfully changed on ${new Date().toLocaleString()}.</p>
            
            <div class="security-notice">
              <strong>Security Notice:</strong>
              <p>If you did not make this change, please contact your system administrator immediately and consider the following:</p>
              <ul>
                <li>Change your password again immediately</li>
                <li>Review your recent account activity</li>
                <li>Enable two-factor authentication if available</li>
              </ul>
            </div>
            
            <p>Your account security is important to us. If you have any concerns, please don't hesitate to reach out.</p>
          </div>
          <div class="footer">
            <p>This email was sent from EvolveSync. If you have any questions, please contact your system administrator.</p>
            <p>&copy; ${new Date().getFullYear()} EvolveSync. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}
