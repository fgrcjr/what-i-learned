export default function Todo(props){
    
    const { todo, setTodo } = props
    
    const updateTodo = async(todoId, todoStatus) => {
        const res = await fetch("/api/todos/${todoId}",{
        method: "PUT",
        body: JSON.stringify({ status: todoStatus }),
        headers:{
            "Content-Type": "application/json"
        },

        })
    }
    
    return(
        <div className="todo">
            <p>{todo.todo}</p>
            <div>
                <button 
                    className="todo_status
                    onClick={() => updateTodo(todo._id, todo.status)}
                    "
                    >{(todo.status) ? "ok" : "no"}
                    
                </button>
            </div>
        </div>
    )
}