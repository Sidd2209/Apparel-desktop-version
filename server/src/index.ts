import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

let prisma: PrismaClient;

function initializePrisma() {
  console.log('🔍 Initializing Prisma client...');
  console.log('📁 Current directory:', process.cwd());
  console.log('🔧 Node environment:', process.env.NODE_ENV);
  
  try {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    console.log('✅ Prisma client initialized successfully');
    return prisma;
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error);
    throw error;
  }
}

const app = express();

// Configure CORS for local development only
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export const startServer = async () => {
  try {
    console.log('🚀 Starting Apparel Flow Backend Server...');
    console.log('📁 Current directory:', process.cwd());
    console.log('🔧 Environment:', process.env.NODE_ENV);
    console.log('🔧 START_SERVER:', process.env.START_SERVER);
    
    // Initialize Prisma client
    const prisma = initializePrisma();
    
    console.log('📦 Starting Apollo Server...');
    await server.start();
    console.log('✅ Apollo Server started');

    // GraphQL endpoint
    app.use(
      '/graphql',
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ 
          token: req.headers.authorization, 
          prisma 
        }),
      }),
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Apparel Flow Backend API',
        version: '1.0.0',
        graphql: '/graphql',
        health: '/health'
      });
    });

    const port = process.env.PORT || 8080;
    const host = 'localhost';

    console.log(`🌐 Starting HTTP server on ${host}:${port}...`);
    app.listen({ host, port }, () => {
      console.log(`🚀 Server ready at http://${host}:${port}/graphql`);
      console.log(`📊 Health check: http://${host}:${port}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Only start server if not imported as a module
if (require.main === module || process.env.START_SERVER === 'true') {
  startServer();
}

export default app;
export { resolvers, typeDefs };