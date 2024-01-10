mkdir webapp
cd webapp

// backend.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Connect to MongoDB
mongoose.connect('mongodb://mongodb-service:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

// Define a simple schema for testing
const TestSchema = new mongoose.Schema({
  message: String,
});

const TestModel = mongoose.model('TestModel', TestSchema);

// Define a route to insert data into MongoDB
app.post('/insert', async (req, res) => {
  const { message } = req.body;
  const test = new TestModel({ message });

  try {
    await test.save();
    res.json({ success: true, message: 'Data inserted successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


---
mkdir frontend
cd frontend
---
npx create-react-app .
---
Create a new file named api.js in the src directory:

// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Change to your backend service URL
});

export const insertData = async (message) => {
  try {
    const response = await api.post('/insert', { message });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
---
In the webapp directory, create a Dockerfile for the backend:
# backend/Dockerfile
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "backend.js"]
---
In the webapp/frontend directory, modify the existing Dockerfile:
# frontend/Dockerfile
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
---
cd webapp
docker build -t backend-image -f Dockerfile .
---
cd frontend
docker build -t frontend-image -f Dockerfile .
---
docker run -d --name mongodb-container -p 27017:27017 mongo
---
docker run -d -p 3001:3001 --name backend-container --link mongodb-container backend-image
---
docker run -d -p 3000:3000 --name frontend-container frontend-image
---
Create a file named mongo-secret.yaml for MongoDB credentials:
# mongo-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secrets
type: Opaque
data:
  mongo-root-username: base64_encoded_username  # Use base64 encoded username
  mongo-root-password: base64_encoded_password  # Use base64 encoded password
---
Create a file named backend-deployment.yaml for the backend deployment:
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend-image
        ports:
        - containerPort: 3001
        envFrom:
        - secretRef:
            name: mongodb-secrets
---
Create a file named frontend-deployment.yaml for the frontend deployment:
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: frontend-image
        ports:
        - containerPort: 3000
---
Create a file named frontend-service.yaml for the frontend service:
# frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
---
as well as:
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
---
kubectl apply -f mongo-secret.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
