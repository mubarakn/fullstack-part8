import React, { useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES, ME } from '../queries'

const Recommend = ({ show }) => {
    const [loadBooks, result] = useLazyQuery(ALL_BOOKS)
    const meResult = useQuery(ME)

    useEffect(() => {
        console.log('meResult', meResult.data)
        if (meResult.data) {
            loadBooks({
                variables: {
                    genre: meResult.data.me.favoriteGenre
                }
            })
        }
    }, [meResult.data])

    if (!show) {
        return null
    }

    if (result.loading) {
        return <div>Loading...</div>
    }

    const books = result.data.allBooks

    return (
        <div>
          <h2>recommendations</h2>
          <p>books in your favorite genre <b>{meResult.data.me.favoriteGenre}</b></p>
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
        </div>
      )
}

export default Recommend