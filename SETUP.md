# Setup Guide for AI Classification

## Environment Variables Setup

To fix the "AI classified department: undefined" error, you need to set up the GROQ API key.

### 1. Get a GROQ API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key

### 2. Set Environment Variables

Create a `.env` file in the root directory of your project with the following content:

```env
# GROQ API Key for AI classification
GROQ_API_KEY=your_actual_groq_api_key_here

# Other environment variables can be added here
```

### 3. Alternative: Set Environment Variable Directly

If you prefer to set the environment variable directly in your terminal:

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="your_actual_groq_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set GROQ_API_KEY=your_actual_groq_api_key_here
```

**Linux/Mac:**
```bash
export GROQ_API_KEY="your_actual_groq_api_key_here"
```

### 4. Restart Your Server

After setting the environment variable, restart your Node.js server for the changes to take effect.

### 5. Test the Fix

Once the API key is set up, the AI classification should work properly and you should see meaningful department classifications instead of "undefined".

## Troubleshooting

- Make sure the `.env` file is in the root directory of your project
- Ensure the API key is valid and has sufficient credits
- Check that the `dotenv` package is properly configured to load environment variables
- Restart the server after making changes to environment variables
