require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmailConfig = async () => {
    console.log('Testing email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ Email configuration is valid!');

        // Send test email
        const info = await transporter.sendMail({
            from: `"Nazmer Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email - Nazmer Backend',
            html: `
        <h2>Email Configuration Test</h2>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);

        if (error.code === 'EAUTH') {
            console.log('\n🔧 Email Authentication Error - Check these:');
            console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail account');
            console.log('2. Generate an App Password (not your regular Gmail password)');
            console.log('3. Use the App Password in EMAIL_PASS environment variable');
            console.log('4. Make sure EMAIL_USER is your full Gmail address');
        }
    }
};

testEmailConfig();
