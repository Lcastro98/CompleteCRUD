import { createContext, useContext, useRef, useEffect, useReducer, useState } from "react";

const HOST_API = "http://localhost:8080/api";

const initialState = {
  list: [],
  item: {}
};

const Store = createContext(initialState)

const Form = () => {
  const formRef = useRef(null);
  const { dispatch, state: {item} } = useContext(Store);
  const [state, setState] = useState(item);

  const onAdd = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      isCompleted: false
    };

    fetch(HOST_API + "/todo", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((todo) => {
      dispatch({ type: "add-item", item: todo });
      setState({ name: ""});
      formRef.current.reset();
    });
  }

  const onEdit = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: item.id,
      isCompleted: item.isCompleted
    };

    fetch(HOST_API + "/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((todo) => {
      dispatch({ type: "update-item", item: todo });
      setState({ name: ""});
      formRef.current.reset();
    });
  }

  return <div className="container">
  <form ref={formRef}>
    <div className="input-group mb-3">
    <input 
      className="form-control"
      type="text" 
      name="name"
      placeholder="Ingrese su tarea por hacer..." 
      defaultValue={item.name}
      onChange={(event) => {
      setState({ ...state, name: event.target.value })
    }} ></input>
    {item.id && <button className="btn btn-dark" onClick={onEdit}>Actualizar</button>} 
    {!item.id && <button className="btn btn-dark" onClick={onAdd}>Agregar</button>}
    </div>
  </form>
  </div>
}

const List = () => {
  const {dispatch, state} = useContext(Store);
  
  useEffect(() => {
    fetch(HOST_API+"/todos")
    .then(response => response.json())
    .then((list) => {
      dispatch({type: "update-list", list})
    })
  }, [state.list.length, dispatch]);

  const onDelete = (id) => {
    fetch(HOST_API + "/" + id + "/todo", {
      method: "DELETE"
    })
    .then((list) => {
      dispatch({ type: "delete-item", id })
    })
  };

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo })
  }

  return <div className="container">
    <table className="table table-dark table-striped">
      <thead>
        <tr>
          <td>ID</td>
          <td>Nombre</td>
          <td>??Esta completado?</td>
          <td>Editar</td>
          <td>Eliminar</td>
        </tr>
      </thead>
      <tbody>
        {state.list.map((todo) => {
          return <tr key={todo.id}>
            <td>{todo.id}</td>
            <td>{todo.name}</td>
            <td>{todo.isCompleted === true ? "SI" : "NO"}</td>
            <td><button className="btn btn-warning btn-sm ml-3" onClick={() => onEdit(todo)}>Editar</button></td>
            <td><button className="btn btn-danger btn-sm ml-3" onClick={() => onDelete(todo.id)}>Eliminar</button></td>
          </tr>
        })}
      </tbody>
    </table>
  </div>
}

function reducer(state, action) {
  switch (action.type) {
    case 'update-item':
      const listUpdateEdit = state.list.map((item) => {
        if(item.id === action.item.id){
          return action.item;
        }
        return item;
      });
      return { ...state, list: listUpdateEdit, item: {}}
    case 'delete-item':
      const listUpdate = state.list.filter((item) => {
        return item.id !== action.id;
      });
      return { ...state, list: listUpdate}
    case 'update-list':
      return {...state, list: action.list}
    case 'edit-item':
      return {...state, item: action.item}
    case 'add-item':
      const newList = state.list;
      newList.push(action.item);
      return {...state, list: newList}
    default:
      return state;
  }
}

const StoreProvider = ({ children }) => {

  const [state, dispatch] = useReducer(reducer, initialState);

  return <Store.Provider value={{ state, dispatch }}>
    {children}
  </Store.Provider>
}

function App() {
  return <StoreProvider>
    <br/>
    <h1 className="container">TODOs</h1>
    <Form />
    <List />
  </StoreProvider>
}

export default App;
