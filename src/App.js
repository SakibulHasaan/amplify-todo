import React, { useState, useEffect } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { v4 as uuid } from 'uuid'
import './App.css'
import awsExports from './aws-exports'
import { listTodos } from './graphql/queries'
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'

Amplify.configure( awsExports )

const initialFormState = { name: '', description: '' }

const App = () => {
  const [ form, setForm ] = useState( initialFormState )
  const [ todos, setTodos ] = useState( [] )
  const [ update, setUpdate ] = useState( initialFormState );

  useEffect( () => {
    fetchTodos()
  }, [] )

  const fetchTodos = async () => {
    const todos = await API.graphql( graphqlOperation( listTodos ) )
    setTodos( todos.data.listTodos.items )
  }

  const handleChange = ( event ) => {
    if ( !update.id ) {
      setForm( { ...form, [ event.target.name ]: event.target.value } )
    }
    else {
      setUpdate( { ...update, [ event.target.name ]: event.target.value } )
    }
  }

  const handleSubmit = async ( e ) => {
    e.preventDefault()
    try {
      if ( form.description && form.name ) {
        const todo = {
          id: uuid(),
          name: form.name,
          description: form.description,
        }
        setForm( initialFormState )
        await API.graphql( graphqlOperation( createTodo, { input: todo } ) )
        fetchTodos()
      }
    } catch ( err ) {
      console.log( err )
    }
  }

  const deleteTodoByID = async ( id ) => {
    try {
      await API.graphql( graphqlOperation( deleteTodo, { input: { id } } ) )
      fetchTodos()
    } catch ( err ) {
      console.log( err )
    }
  }

  const updateTodoByID = async () => {
    try {
      if ( update.description && update.name ) {
        const todo = {
          id: update.id,
          name: update.name,
          description: update.description
        }
        setUpdate( initialFormState );
        await API.graphql( graphqlOperation( updateTodo, { input: todo } ) )
        fetchTodos()
      }
    } catch ( err ) {
      console.log( err )
    }
  }

  console.log(update);

  return (
    <div className='main'>
      <div className='form'>
        <form onSubmit={( e ) => handleSubmit( e )} className='todo-form'>
          <div className='form-group'>
            <div>
              <label htmlFor='name'>Title</label>
            </div>
            <div>
              <input
                onChange={( event ) => handleChange( event )}
                value={form.name}
                name='name'
                className='form-input'
              />
            </div>
          </div>
          <div className='form-group'>
            <div>
              <label htmlFor='description'>Description</label>
            </div>
            <div>
              <input
                onChange={( event ) => handleChange( event )}
                value={form.description}
                name='description'
                className='form-input form-desc'
              />
            </div>
          </div>
          <button type='submit'>SAVE</button>
        </form>
      </div>
      <div className='container'>
        <div className='todos'>
          {todos.map( ( item: todo, index: number ) => {
            return (
              <div className='todo' key={index}>
                <button onClick={() => deleteTodoByID( item.id )}>Delete</button>
                {
                  update.id ? <button className="update" onClick={updateTodoByID}>Save</button> :
                  <button className="update" onClick={() => setUpdate( item )}>Update</button>
                }

                {
                  update.id ? 
                  <input
                    style={{marginTop: "10px"}}
                    onChange={( event ) => handleChange( event )}
                    value={update.name}
                    name='name'
                    className='form-input'
                  /> : <h4>TITLE: {item.name}</h4>
                }

                {
                  update.id ?
                    <input style={{marginTop: "10px"}}
                      onChange={( event ) => handleChange( event )}
                      value={update.description}
                      name='description'
                      className='form-input form-desc'
                    />
                    : <p>DESCRIPTION: {item.description}</p>
                }
              </div>
            )
          } )}
        </div>
      </div>
    </div>
  )
}

export default App