import smtplib
from email.message import EmailMessage

# ----------------------------
# Email Configuration
# ----------------------------
SENDER_EMAIL = "your_email@gmail.com"
SENDER_PASSWORD = "your_app_password"  # Gmail App Password
RECEIVER_EMAIL = "receiver_email@gmail.com,receiver_email@gmail.com,"

# ----------------------------
# Create Email
# ----------------------------
msg = EmailMessage()
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL
msg["Subject"] = "Regarding Project Submission"

msg.set_content("""
Dear Sir/Madam,

I hope this email finds you well.

I am writing to inform you that I have successfully completed and submitted my project as per the given guidelines. Kindly review it and let me know if any modifications are required.

Thank you for your time and support.

Warm regards,  
Amit Padhan  
B.Tech (CSE)  
Mobile: 7505795679  
Email: padhanamit072006@gmail.com
""")

# ----------------------------
# Send Email Securely
# ----------------------------
try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        print("✅ Email sent successfully!")

except Exception as e:
    print("❌ Failed to send email")
    print(e)
