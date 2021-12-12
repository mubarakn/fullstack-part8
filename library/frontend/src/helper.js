import { ALL_BOOKS } from "./queries"

export const updateCacheWith = (client, addedBook) => {
    const includedIn = (set, object) =>
        set.map(p => p.id).includes(object.id)
    
    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
        client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
        })
    }
}