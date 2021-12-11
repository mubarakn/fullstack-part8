import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = (props) => {
  const [loadBooks, result] = useLazyQuery(ALL_BOOKS)
  const genresResult = useQuery(ALL_GENRES)
  const [genre, setGenre] = useState(null)

  useEffect(() => {
    if (genre) {
      loadBooks({
        variables: { genre }
      })
      return
    }
    loadBooks()
  }, [genre])

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genresResult.data.genres.map(g => <button key={g} onClick={() => setGenre(g)}>{g}</button>)}
    </div>
  )
}

export default Books