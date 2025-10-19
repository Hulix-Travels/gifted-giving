# MongoDB Atlas Setup Guide for Gifted givings App

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose the "FREE" tier (M0)

## Step 2: Create a Cluster

1. Click "Build a Database"
2. Select "FREE" tier
3. Choose cloud provider (AWS, Google Cloud, or Azure)
4. Select region close to you
5. Keep default cluster name or name it "gifted-giving-cluster"
6. Click "Create"

## Step 3: Set Up Database Access

1. Go to "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `gifted-giving-user`
4. Password: Create a strong password (save it!)
5. Role: "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access

1. Go to "Security" → "Network Access"
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Deployments" → "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## Step 6: Configure Your App

1. Create a `.env` file in the server directory:
```bash
cp config.env .env
```

2. Edit the `.env` file and replace the MONGODB_URI with your actual connection string:
```
MONGODB_URI=mongodb+srv://gifted-giving-user:YOUR_ACTUAL_PASSWORD@YOUR_CLUSTER_URL/gifted-giving?retryWrites=true&w=majority
```

3. Replace:
   - `YOUR_ACTUAL_PASSWORD` with the password you created in Step 3
   - `YOUR_CLUSTER_URL` with your actual cluster URL

## Step 7: Test the Connection

1. Restart your server:
```bash
npm run dev
```

2. Check the console output - you should see:
   - ✅ Connected to MongoDB successfully

3. Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

You should see: `{"database":"connected"}`

## Troubleshooting

- **Connection refused**: Make sure you've added your IP to Network Access
- **Authentication failed**: Check your username and password
- **Cluster not found**: Verify your cluster URL is correct

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for database users
- In production, restrict IP access to your server's IP only
- Consider using MongoDB Atlas VPC peering for enhanced security 