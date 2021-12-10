require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server')
const { ApolloServerPluginLandingPageGraphQLPlayground, UserInputError } = require('apollo-server-core')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
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
    }

    type Mutation {
      addAuthor(name: String!, born: Int!): Author
      addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
      editAuthor(name: String!, setBornTo: Int!): Author
      createUser(username: String!, favoriteGenre: String!): User
      login(username: String!, password: String!): Token
    }
`

const resolvers = {
  Query: {
    me: (root, args, { currentUser }) => ({ currentUser }),
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
        if (!args.author && !args.genre) {
            return books
        }
        let filteredBooks = books
        if (args.author) {
            filteredBooks = filteredBooks.filter(b => b.author === args.author)
        }
        if (args.genre) {
            filteredBooks = filteredBooks.filter(b => b.genres.includes(args.genre))
        }
        return filteredBooks
    },
    allAuthors: async () => Author.find({})
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
    addBook: async (root, args) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const book = new Book({ ...args })
      try {
        await book.save()
        await book.populate('author')
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
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground()
  ]
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})