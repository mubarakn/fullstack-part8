require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server-express')
const { ApolloServerPluginLandingPageGraphQLPlayground, UserInputError, ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const express = require('express')
const { createServer } = require('http')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { PubSub } = require('graphql-subscriptions')

const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to mongodb')
  })
  .catch(error => {
    console.error(error)
  })

mongoose.set('debug', true)

const typeDefs = gql`
    type User {
      username: String!
      favoriteGenre: String!
      id: ID!
    }
    type Token {
      value: String!
    }
    type Book {
        title: String!
        published: Int!
        author: Author!
        genres: [String!]!
        id: ID!
    }

    type Author {
        id: ID!
        name: String!
        bookCount: Int!
        born: Int
    }
    
    type Query {
        me: User
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        genres: [String!]!
    }

    type Mutation {
      addAuthor(name: String!, born: Int!): Author
      addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
      editAuthor(name: String!, setBornTo: Int!): Author
      createUser(username: String!, favoriteGenre: String!): User
      login(username: String!, password: String!): Token
    }

    type Subscription {
      bookAdded: Book!
    }
`

const pubsub = new PubSub()

const resolvers = {
  Query: {
    me: (root, args, { currentUser }) => currentUser,
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
        if (!args.author && !args.genre) {
            return Book.find({}).populate('author')
        }
        let filter = {}
        if (args.author) {
            filter.author = args.author
        }
        if (args.genre) {
            filter.genres = args.genre
        }
        return Book.find(filter).populate('author')
    },
    allAuthors: async () => Author.find({}),
    genres: async () => {
      let genres = new Set()
      const books = await Book.find({}, {genres: 1})
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        for (let j = 0; j < book.genres.length; j++) {
          const genre = book.genres[j];
          genres.add(genre)
        }
      }
      return genres
    }
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({ ...args })
      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error, { invalidArgs: args })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.SECRET) }
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      try {
        await author.save() 
      } catch (error) {
        throw new UserInputError(error, { invalidArgs: args })
      }
      return author
    },
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const book = new Book({ ...args })
      try {
        await book.save()
        await book.populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded: book } )
      } catch (error) {
        throw new UserInputError(error, { invalidArgs: args })
      }
      return book
    },
    editAuthor: async (root, args) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const author = Author.findById(args.id)
      author.born = args.born
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error, { invalidArgs: args })
      }
      return author
    }
  },
  Author: {
      bookCount: async (root, args) => Book.count({ author: root.id })
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

async function startApolloServer(schema) {
  const app = express()
  const httpServer = createServer(app)

  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe
  }, {
    server: httpServer,
    path: '/'
  })

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            }
          }
        }
      }
    ]
  })

  await server.start()
  server.applyMiddleware({ app, path: '/' })
  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve))
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  console.log(`sub server path ${subscriptionServer.server.path}`)
}
startApolloServer(schema)