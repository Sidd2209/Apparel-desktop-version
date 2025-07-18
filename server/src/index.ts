import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const startServer = async () => {
  try {
    await server.start();

    // Handle preflight requests for /graphql
    app.options('/graphql', cors({
      origin: [
        'http://localhost:5173',
        'https://apparel-flow-frontend.onrender.com',
        'https://apparel-flow-10.onrender.com'
      ],
      credentials: true
    }));

    app.use(
      '/graphql',
      cors({
        origin: [
          'http://localhost:5173',
          'https://apparel-flow-frontend.onrender.com',
          'https://apparel-flow-10.onrender.com'
        ],
        credentials: true
      }),
      bodyParser.json(),
      (req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
        next();
      },
      expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.authorization, prisma }),
      }),
    );

    const port = process.env.PORT || 8080;
    const host = '0.0.0.0'; // Required for Render deployment

    app.listen({ host, port }, () => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

if (!process.env.FUNCTION_NAME) {
  startServer();
}

export default app;
export { resolvers, typeDefs };