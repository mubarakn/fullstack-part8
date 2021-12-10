  
import React from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import { EDIT_AUTHOR } from '../mutations'

const Authors = (props) => {
  const authorsResult = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR)

  if (!props.show) {
    return null
  }

  if (authorsResult.loading) {
    return <div>Loading...</div>
  }

  const handleBirthSubmit = event => {
    event.preventDefault()
    const name = event.target.name.value
    const year = event.target.year.value
    event.target.name.value = authorsResult.data.allAuthors[0].name
    event.target.year.value = ''

    editAuthor({ variables: { name, year: Number(year) } })
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authorsResult.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Set birthyear</h2>
      <form onSubmit={handleBirthSubmit}>
        <div>
          <label>Name</label>
          <select name='name'>
            {authorsResult.data.allAuthors.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label>Born</label>
          <input type="number" name="year" />
        </div>
        <button type='submit'>update author</button>
      </form>

    </div>
  )
}

export default Authors
