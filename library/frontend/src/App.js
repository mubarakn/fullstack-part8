
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import Login from './components/Login'
import NewBook from './components/NewBook'
import Recommend from './components/Recommend'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('auth_token') ? localStorage.getItem('auth_token') :  null)

  const handleLoggedIn = token => {
    setToken(token)
    setPage('authors')
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {
          token
          ? (
            <>
              <button onClick={() => setPage('add')}>add book</button>
              <button onClick={() => setPage('recommend')}>recommend</button>
              <button onClick={handleLogout}>logout</button>
            </>
          )
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

      <Login onLoggedIn={handleLoggedIn} show={page === 'login'} />

      <Recommend show={page === 'recommend'} />

    </div>
  )
}

export default App