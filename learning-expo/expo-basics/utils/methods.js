export const isValidObjField = (obj) => {
    Object.values(obj).every(value => value.trim())
}
  
export const updateError = (error, stateUpdate) => {
    stateUpdate(error)
    setTimeout(() => {
        stateUpdate('')
    }, 2500)
}

export const isValidEmail = (value) => {
    const regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regx.test(value)
}
