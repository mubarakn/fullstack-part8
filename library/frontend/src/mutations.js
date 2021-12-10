import { gql } from '@apollo/client'

export const ADD_BOOK = gql`
    mutation createBook(
        $title: String!,
        $published: Int!,
        $author: String!,
        $genres: [String!]!
    ) {
        addBook(title: $title, published: $published, author: $author, genres: $genres) {
            id
            title
            published
            author
            genres
        }
    }
`

export const EDIT_AUTHOR = gql`
    mutation editAuthor(
        $name: String!
        $year: Int!
    ) {
        editAuthor(name: $name, setBornTo: $year) {
            id
            name
            born
        }
    }
`