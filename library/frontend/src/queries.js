import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
query {
    allAuthors {
        id
        name
        born
    }
}
`

export const ALL_BOOKS = gql`
query allBooks($genre: String) {
    allBooks(genre: $genre) {
        title
        author {
            id
            name
            born
        }
        published
    }
}
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