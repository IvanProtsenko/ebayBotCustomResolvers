import { ApolloServer, gql } from 'apollo-server';
import dotenv from 'dotenv';
import { MessagingService } from './services/MessagingService';
import { sendMessageRequest } from './services/Requests';

dotenv.config();
const messagingService = new MessagingService();

const typeDefs = gql`
  input messageRequest {
    url: String
    text: String
  }

  type ResponseMsg {
    send_success: Boolean
    update_success: Boolean
    errorMsg: String
  }

  type Mutation {
    sendMessage(payload: messageRequest): ResponseMsg!
  }

  type Query {
    Orders(id: ID!): ID!
  }
`;

const resolvers = {
  Mutation: {
    sendMessage: async (parent: any, args: any, context: any, info: any) => {
      try {
        const response = await messagingService.sendMessage(
          args.payload.text,
          args.payload.url
        );
        // const messageToSend = {
        //   message: args.payload.text,
        //   adId: args.payload.adId,
        // };
        // const response = await sendMessageRequest(messageToSend);

        return response;
      } catch (err) {
        console.log(err);
        return 'error';
      }
    },
  },
  Query: {
    Orders: (parent: any, args: any, context: any, info: any) => {
      return args.id;
    },
  },
};

async function run() {
  await messagingService.start();

  const server = new ApolloServer({
    cors: { allowedHeaders: '*' },
    typeDefs,
    resolvers,
  });

  server.listen(4000).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

run();
