import React, { useState } from 'react'
import { useSubscription, useApolloClient } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import Login from './components/Login'
import NewBook from './components/NewBook'
import Recommend from './components/Recommend'
import { BOOK_ADDED } from './queries'
import { updateCacheWith } from './helper'

const App = () => {
  const apolloClient = useApolloClient()
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('auth_token') ? localStorage.getItem('auth_token') :  null)

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`${addedBook.title} by ${addedBook.author.name} added`)
      updateCacheWith(apolloClient, addedBook)
    }
  })

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