import { gql } from '@apollo/client'

export const FRAGMENT_AUTHOR = gql`
fragment AuthorDetails on Author {
    id
    name
    born
}
`

export const ALL_AUTHORS = gql`
query {
    allAuthors {
        ...AuthorDetails
    }
}
${FRAGMENT_AUTHOR}
`

export const ALL_BOOKS = gql`
query allBooks($genre: String) {
    allBooks(genre: $genre) {
        title
        author {
            ...AuthorDetails
        }
        published
    }
}
${FRAGMENT_AUTHOR}
`

export const ALL_GENRES = gql`
query {
    genres
}
`

export const ME = gql`
query {
    me {
        favoriteGenre
    }
}
`

export const BOOK_ADDED = gql`
subscription {
    bookAdded {
        title
        author {
            ...AuthorDetails
        }
        published
    }
}
`