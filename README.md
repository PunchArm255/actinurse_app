# Welcome to ActiNurse 🏥

**ActiNurse** is a web app designed to make task management and performance tracking for nurses simple and efficient. Whether you're logging tasks, monitoring your progress, or setting reminders for important actions, **ActiNurse** has got you covered! 🩺💼

## 🚀 Concept

The idea behind **ActiNurse** is to create a platform that assists healthcare professionals in managing their tasks with ease, track their performance over time, and stay on top of things that need verification. The user-friendly interface ensures that busy nurses can log tasks, see their progress, and receive reminders effortlessly. 

## 🛠️ Technologies Used

- ⚛️ **React** – for building dynamic, reusable components.
- 🎨 **Tailwind CSS** – for modern, responsive design.
- 🟥 **Appwrite** - for backend and databases.

## ✨ Features

- **Task Logging**: Log your daily tasks with a click 📝.
- **Performance Tracking**: View a graph of your task completion over time 📈.
- **Reminders**: Stay on top of things that need checking ✅.

---

## 🔗 Live Demo

Coming soon!

---

Feel free to contribute or share your feedback! ❤️

---

# ActiNurse Authentication Setup

## Important Setup Instructions

To get the authentication working correctly:

1. Set the Appwrite Project ID in `src/lib/appwrite.js`:

```javascript
// Appwrite configuration
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6810adc30016c23ec237'); // Already configured with your Project ID
```

2. Make sure that your Appwrite project has the correct hostname configured:
   - Go to your Appwrite console
   - Navigate to your project settings
   - Under "Platforms," make sure you have added your localhost domain (e.g., http://localhost:5173)

## Testing Authentication

When testing authentication:

1. The signup process should:
   - Create a new user account 
   - Automatically log in the user
   - Redirect to the home page

2. If you encounter any issues:
   - Check the browser console for detailed error messages
   - Verify your Appwrite project settings
   - Ensure you have the correct project ID

## Authentication Flow

This implementation uses direct Appwrite SDK calls without Context API for simplicity:

1. User signs up with email/password
2. User is automatically logged in after sign-up
3. Protected routes check for authentication on each page load
4. Login/logout functions manage user sessions

## Debug Information

If sign up is not working:
- Check if there are any console errors
- Verify your Appwrite project ID is correct
- Make sure you've added the correct platform/hostname in Appwrite
- Check password requirements (min 8 characters by default)
- Verify if your email format is valid
